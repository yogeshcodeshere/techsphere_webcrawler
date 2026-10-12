import argparse,csv,hashlib,json,time
from collections import deque
from pathlib import Path
from urllib.parse import urljoin,urlparse,urldefrag
from urllib.robotparser import RobotFileParser
import requests
from bs4 import BeautifulSoup

UA="TechSphereEducationalCrawler/1.0 (+academic project)"
def norm(url):
 url,_=urldefrag(url); p=urlparse(url)
 if p.scheme not in ("http","https"): return ""
 path=p.path or "/"
 if path.endswith("/index.html"): path=path[:-10]
 if path!="/" and not path.endswith(".html") and "." not in path.rsplit("/",1)[-1]: path=path.rstrip("/")+"/"
 return p._replace(path=path,query="",fragment="").geturl()
def main():
 ap=argparse.ArgumentParser(description="TechSphere BFS web crawler")
 ap.add_argument("start_url");ap.add_argument("--max-pages",type=int,default=100);ap.add_argument("--max-depth",type=int,default=8);ap.add_argument("--delay",type=float,default=.25);ap.add_argument("--use-sitemap",action="store_true");ap.add_argument("--out",default="reports");a=ap.parse_args()
 start=norm(a.start_url);parsed=urlparse(start);host=parsed.netloc;base=f"{parsed.scheme}://{host}";s=requests.Session();s.headers["User-Agent"]=UA
 rp=RobotFileParser();rp.set_url(base+"/robots.txt")
 try:rp.read();robots_ok=True
 except Exception as e:print("Warning: could not read robots.txt:",e);robots_ok=False
 q=deque([(start,0,"seed")])
 if a.use_sitemap:
  try:
   r=s.get(base+"/sitemap.xml",timeout=10);r.raise_for_status()
   sm=BeautifulSoup(r.text,"xml")
   for loc in sm.find_all("loc"):
    u=norm(loc.get_text(strip=True))
    if u and urlparse(u).netloc==host:q.append((u,0,"sitemap"))
  except Exception as e:print("Warning: sitemap unavailable:",e)
 seen=set();records=[];edges=[];digests={};fetched=0
 while q and fetched<a.max_pages:
  url,depth,source=q.popleft();url=norm(url)
  if not url or url in seen or urlparse(url).netloc!=host:continue
  seen.add(url)
  if robots_ok and not rp.can_fetch(UA,url):
   records.append(dict(url=url,status="ROBOTS_DISALLOWED",depth=depth,title="",word_count=0,sha256="",source=source));print("[robots]",url);continue
  try:
   r=s.get(url,timeout=12,allow_redirects=True);time.sleep(max(0,a.delay));ctype=r.headers.get("content-type","")
   if r.status_code>=400 or "text/html" not in ctype:
    records.append(dict(url=url,status=r.status_code,depth=depth,title="",word_count=0,sha256="",source=source));continue
   soup=BeautifulSoup(r.text,"html.parser");title=soup.title.get_text(" ",strip=True) if soup.title else ""
   for t in soup(["script","style","noscript","svg"]):t.decompose()
   content=" ".join(soup.stripped_strings);digest=hashlib.sha256(content.encode()).hexdigest();digests.setdefault(digest,[]).append(url);fetched+=1
   records.append(dict(url=url,status=r.status_code,depth=depth,title=title,word_count=len(content.split()),sha256=digest,source=source))
   print(f"[{r.status_code}] depth={depth} {url}")
   for tag in soup.find_all("a",href=True):
    dest=norm(urljoin(r.url,tag["href"]))
    if dest and urlparse(dest).netloc==host:
     edges.append({"source":url,"target":dest})
     if dest not in seen and depth<a.max_depth:q.append((dest,depth+1,"link"))
  except requests.RequestException as e:
   records.append(dict(url=url,status="ERROR",depth=depth,title="",word_count=0,sha256="",source=source));print("Error:",url,e)
 out=Path(a.out);out.mkdir(parents=True,exist_ok=True)
 with (out/"crawl_report.csv").open("w",newline="",encoding="utf-8") as f:
  w=csv.DictWriter(f,fieldnames=["url","status","depth","title","word_count","sha256","source"]);w.writeheader();w.writerows(records)
 with (out/"link_edges.csv").open("w",newline="",encoding="utf-8") as f:
  w=csv.DictWriter(f,fieldnames=["source","target"]);w.writeheader();w.writerows(edges)
 summary={"start_url":start,"urls_seen":len(seen),"pages_fetched":fetched,"records":len(records),"links_recorded":len(edges),"exact_duplicate_groups":{k:v for k,v in digests.items() if len(v)>1},"robots_loaded":robots_ok,"sitemap_seeded":a.use_sitemap}
 (out/"summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8");print(json.dumps(summary,indent=2))
if __name__=="__main__":main()
