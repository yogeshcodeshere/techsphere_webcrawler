/**
 * TechSphere - Interactive Web Crawler & robots.txt Simulator
 * Pure Vanilla JavaScript BFS Simulation Engine
 * Demonstrates:
 * 1. FIFO Queue (collections.deque in Python crawler.py)
 * 2. RFC 9309 robots.txt interception (/drafts/, /internal/)
 * 3. O(1) Hash Set duplicate URL avoidance (seen = set())
 */

(function () {
  'use strict';

  // Site Link Graph based on TechSphere's actual page inventory
  const SITE_GRAPH = {
    "/": {
      title: "TechSphere - Systems & Mining",
      depth: 0,
      group: "Root",
      links: [
        "/categories/ai/",
        "/categories/cybersecurity/",
        "/categories/programming/",
        "/categories/cloud/",
        "/categories/web-data/",
        "/about/",
        "/methodology/",
        "/authors/",
        "/contact/",
        "/crawler-view/",
        "/case-study/",
        "/drafts/crawler-test.html",
        "/internal/crawler-notes.html",
        "/articles/ai/what-is-machine-learning/",
        "/articles/web-data/web-crawling/"
      ]
    },
    "/categories/ai/": {
      title: "Artificial Intelligence",
      depth: 1,
      group: "Categories",
      links: [
        "/",
        "/about/",
        "/articles/ai/what-is-machine-learning/",
        "/articles/ai/neural-networks/",
        "/articles/ai/llms-explained/",
        "/articles/ai/rag-systems/",
        "/articles/ai/computer-vision/",
        "/articles/ai/model-evaluation/"
      ]
    },
    "/categories/cybersecurity/": {
      title: "Cybersecurity",
      depth: 1,
      group: "Categories",
      links: [
        "/",
        "/about/",
        "/articles/cybersecurity/encryption-basics/",
        "/articles/cybersecurity/phishing-attacks/",
        "/articles/cybersecurity/password-security/",
        "/articles/cybersecurity/web-security/",
        "/articles/cybersecurity/network-defense/",
        "/articles/cybersecurity/zero-trust/"
      ]
    },
    "/categories/programming/": {
      title: "Programming",
      depth: 1,
      group: "Categories",
      links: [
        "/",
        "/about/",
        "/articles/programming/data-structures/",
        "/articles/programming/algorithms/",
        "/articles/programming/python/",
        "/articles/programming/javascript/",
        "/articles/programming/apis/",
        "/articles/programming/git-workflows/"
      ]
    },
    "/categories/cloud/": {
      title: "Cloud Computing",
      depth: 1,
      group: "Categories",
      links: [
        "/",
        "/about/",
        "/articles/cloud/cloud-computing/",
        "/articles/cloud/docker-containers/",
        "/articles/cloud/ci-cd-pipelines/",
        "/articles/cloud/kubernetes/",
        "/articles/cloud/serverless/",
        "/articles/cloud/monitoring/"
      ]
    },
    "/categories/web-data/": {
      title: "Web & Data Mining",
      depth: 1,
      group: "Categories",
      links: [
        "/",
        "/about/",
        "/articles/web-data/web-crawling/",
        "/articles/web-data/robots-protocol/",
        "/articles/web-data/sitemaps/",
        "/articles/web-data/search-engines/",
        "/articles/web-data/tfidf-similarity/",
        "/articles/web-data/link-analysis/"
      ]
    },
    "/about/": {
      title: "About TechSphere",
      depth: 1,
      group: "Pages",
      links: ["/", "/authors/", "/methodology/", "/contact/"]
    },
    "/methodology/": {
      title: "Project Methodology",
      depth: 1,
      group: "Pages",
      links: ["/", "/about/", "/crawler-view/", "/articles/web-data/web-crawling/"]
    },
    "/authors/": {
      title: "Authors & Team",
      depth: 1,
      group: "Pages",
      links: ["/", "/about/", "/methodology/"]
    },
    "/contact/": {
      title: "Contact & Feedback",
      depth: 1,
      group: "Pages",
      links: ["/", "/about/", "/articles/web-data/web-crawling/"]
    },
    "/crawler-view/": {
      title: "Crawler View & Simulator",
      depth: 1,
      group: "Pages",
      links: ["/", "/methodology/", "/drafts/crawler-test.html", "/internal/crawler-notes.html"]
    },
    "/case-study/": {
      title: "Case Study: Reddit vs AI Crawlers",
      depth: 1,
      group: "Pages",
      links: ["/", "/crawler-view/", "/methodology/"]
    },
    "/drafts/crawler-test.html": {
      title: "Draft Crawler Trap",
      depth: 1,
      group: "Disallowed",
      links: ["/"]
    },
    "/internal/crawler-notes.html": {
      title: "Internal Developer Notes",
      depth: 1,
      group: "Disallowed",
      links: ["/"]
    },
    // AI Articles
    "/articles/ai/what-is-machine-learning/": {
      title: "What Is Machine Learning?",
      depth: 2,
      group: "AI",
      links: ["/", "/categories/ai/", "/articles/ai/neural-networks/"]
    },
    "/articles/ai/neural-networks/": {
      title: "Neural Networks Explained",
      depth: 2,
      group: "AI",
      links: ["/", "/categories/ai/", "/articles/ai/llms-explained/"]
    },
    "/articles/ai/llms-explained/": {
      title: "Large Language Models",
      depth: 2,
      group: "AI",
      links: ["/", "/categories/ai/", "/articles/ai/rag-systems/"]
    },
    "/articles/ai/rag-systems/": {
      title: "Retrieval-Augmented Generation",
      depth: 2,
      group: "AI",
      links: ["/", "/categories/ai/", "/articles/ai/computer-vision/"]
    },
    "/articles/ai/computer-vision/": {
      title: "Computer Vision Basics",
      depth: 2,
      group: "AI",
      links: ["/", "/categories/ai/", "/articles/ai/model-evaluation/"]
    },
    "/articles/ai/model-evaluation/": {
      title: "Evaluating AI Models",
      depth: 2,
      group: "AI",
      links: ["/", "/categories/ai/", "/methodology/"]
    },
    // Cybersecurity Articles
    "/articles/cybersecurity/encryption-basics/": {
      title: "Encryption Basics",
      depth: 2,
      group: "Cybersecurity",
      links: ["/", "/categories/cybersecurity/", "/articles/cybersecurity/phishing-attacks/"]
    },
    "/articles/cybersecurity/phishing-attacks/": {
      title: "Recognising Phishing Attacks",
      depth: 2,
      group: "Cybersecurity",
      links: ["/", "/categories/cybersecurity/", "/articles/cybersecurity/password-security/"]
    },
    "/articles/cybersecurity/password-security/": {
      title: "Password Security",
      depth: 2,
      group: "Cybersecurity",
      links: ["/", "/categories/cybersecurity/", "/articles/cybersecurity/web-security/"]
    },
    "/articles/cybersecurity/web-security/": {
      title: "Web Application Security",
      depth: 2,
      group: "Cybersecurity",
      links: ["/", "/categories/cybersecurity/", "/articles/cybersecurity/network-defense/"]
    },
    "/articles/cybersecurity/network-defense/": {
      title: "Network Defense",
      depth: 2,
      group: "Cybersecurity",
      links: ["/", "/categories/cybersecurity/", "/articles/cybersecurity/zero-trust/"]
    },
    "/articles/cybersecurity/zero-trust/": {
      title: "Zero Trust Principles",
      depth: 2,
      group: "Cybersecurity",
      links: ["/", "/categories/cybersecurity/", "/methodology/"]
    },
    // Programming Articles
    "/articles/programming/data-structures/": {
      title: "Data Structures",
      depth: 2,
      group: "Programming",
      links: ["/", "/categories/programming/", "/articles/programming/algorithms/"]
    },
    "/articles/programming/algorithms/": {
      title: "Algorithms and Complexity",
      depth: 2,
      group: "Programming",
      links: ["/", "/categories/programming/", "/articles/programming/python/"]
    },
    "/articles/programming/python/": {
      title: "Python for Practical Projects",
      depth: 2,
      group: "Programming",
      links: ["/", "/categories/programming/", "/articles/programming/javascript/"]
    },
    "/articles/programming/javascript/": {
      title: "JavaScript on the Web",
      depth: 2,
      group: "Programming",
      links: ["/", "/categories/programming/", "/articles/programming/apis/"]
    },
    "/articles/programming/apis/": {
      title: "Understanding APIs",
      depth: 2,
      group: "Programming",
      links: ["/", "/categories/programming/", "/articles/programming/git-workflows/"]
    },
    "/articles/programming/git-workflows/": {
      title: "Git Workflows",
      depth: 2,
      group: "Programming",
      links: ["/", "/categories/programming/", "/methodology/"]
    },
    // Cloud Articles
    "/articles/cloud/cloud-computing/": {
      title: "Cloud Computing Explained",
      depth: 2,
      group: "Cloud",
      links: ["/", "/categories/cloud/", "/articles/cloud/docker-containers/"]
    },
    "/articles/cloud/docker-containers/": {
      title: "Docker and Containers",
      depth: 2,
      group: "Cloud",
      links: ["/", "/categories/cloud/", "/articles/cloud/ci-cd-pipelines/"]
    },
    "/articles/cloud/ci-cd-pipelines/": {
      title: "CI/CD Pipelines",
      depth: 2,
      group: "Cloud",
      links: ["/", "/categories/cloud/", "/articles/cloud/kubernetes/"]
    },
    "/articles/cloud/kubernetes/": {
      title: "Kubernetes Fundamentals",
      depth: 2,
      group: "Cloud",
      links: ["/", "/categories/cloud/", "/articles/cloud/serverless/"]
    },
    "/articles/cloud/serverless/": {
      title: "Serverless Computing",
      depth: 2,
      group: "Cloud",
      links: ["/", "/categories/cloud/", "/articles/cloud/monitoring/"]
    },
    "/articles/cloud/monitoring/": {
      title: "Application Monitoring",
      depth: 2,
      group: "Cloud",
      links: ["/", "/categories/cloud/", "/methodology/"]
    },
    // Web Mining Articles
    "/articles/web-data/web-crawling/": {
      title: "How Web Crawlers Work",
      depth: 2,
      group: "Web Mining",
      links: ["/", "/categories/web-data/", "/articles/web-data/robots-protocol/", "/methodology/"]
    },
    "/articles/web-data/robots-protocol/": {
      title: "Understanding robots.txt",
      depth: 2,
      group: "Web Mining",
      links: ["/", "/categories/web-data/", "/articles/web-data/sitemaps/", "/methodology/"]
    },
    "/articles/web-data/sitemaps/": {
      title: "Sitemaps and URL Discovery",
      depth: 2,
      group: "Web Mining",
      links: ["/", "/categories/web-data/", "/articles/web-data/search-engines/", "/methodology/"]
    },
    "/articles/web-data/search-engines/": {
      title: "Search Engines Discovery",
      depth: 2,
      group: "Web Mining",
      links: ["/", "/categories/web-data/", "/articles/web-data/tfidf-similarity/"]
    },
    "/articles/web-data/tfidf-similarity/": {
      title: "TF-IDF and Similarity",
      depth: 2,
      group: "Web Mining",
      links: ["/", "/categories/web-data/", "/articles/web-data/link-analysis/"]
    },
    "/articles/web-data/link-analysis/": {
      title: "Link Analysis & PageRank",
      depth: 2,
      group: "Web Mining",
      links: ["/", "/categories/web-data/", "/methodology/"]
    }
  };

  // State variables
  let queue = [];            // FIFO queue of { url, depth, source }
  let enqueuedSet = new Set(); // URLs that have entered the queue
  let visitedSet = new Set();  // URLs that have been processed
  let blockedSet = new Set();  // URLs disallowed by robots.txt
  let isRunning = false;
  let timerId = null;
  let delayMs = 600;
  let stepCount = 0;
  let duplicateCount = 0;

  // DOM elements cache
  let dom = {};

  function initDOM() {
    dom = {
      playBtn: document.getElementById('simPlayBtn'),
      stepBtn: document.getElementById('simStepBtn'),
      resetBtn: document.getElementById('simResetBtn'),
      robotsToggle: document.getElementById('simRobotsToggle'),
      speedSelect: document.getElementById('simSpeedSelect'),
      metricQueue: document.getElementById('metricQueue'),
      metricFetched: document.getElementById('metricFetched'),
      metricBlocked: document.getElementById('metricBlocked'),
      metricDupes: document.getElementById('metricDupes'),
      statusText: document.getElementById('simStatusText'),
      queueList: document.getElementById('simQueueList'),
      terminal: document.getElementById('simTerminal'),
      tree: document.getElementById('simTree')
    };
  }

  function checkRobotsDisallowed(url) {
    if (!dom.robotsToggle || !dom.robotsToggle.checked) return false;
    return url.startsWith('/drafts/') || url.startsWith('/internal/');
  }

  function appendLog(text, type) {
    if (!dom.terminal) return;
    const line = document.createElement('div');
    line.className = 'sim-log-line ' + (type || 'info');
    
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    line.innerHTML = `<span class="sim-log-ts">[${time}]</span> ${text}`;
    dom.terminal.appendChild(line);
    dom.terminal.scrollTop = dom.terminal.scrollHeight;
  }

  function updateMetrics() {
    if (dom.metricQueue) dom.metricQueue.textContent = queue.length;
    if (dom.metricFetched) dom.metricFetched.textContent = visitedSet.size;
    if (dom.metricBlocked) dom.metricBlocked.textContent = blockedSet.size;
    if (dom.metricDupes) dom.metricDupes.textContent = duplicateCount;
  }

  function renderQueue() {
    if (!dom.queueList) return;
    if (queue.length === 0) {
      dom.queueList.innerHTML = `<div class="sim-empty-state"><i class="fa-solid fa-inbox"></i> FIFO Queue is empty.</div>`;
      return;
    }

    let html = '';
    queue.slice(0, 15).forEach((item, idx) => {
      const isNext = idx === 0;
      html += `
        <div class="sim-queue-item ${isNext ? 'active' : ''}">
          <div class="sim-queue-meta">
            <span class="sim-depth-badge">Depth ${item.depth}</span>
            <span class="sim-queue-pos">${isNext ? '▶ NEXT POP' : '#' + (idx + 1)}</span>
          </div>
          <div class="sim-queue-url" title="${item.url}">${item.url}</div>
        </div>
      `;
    });

    if (queue.length > 15) {
      html += `<div class="sim-queue-more">+ ${queue.length - 15} more in deque...</div>`;
    }

    dom.queueList.innerHTML = html;
  }

  function renderTree() {
    if (!dom.tree) return;
    const groups = {
      "Root & Categories": ["/", "/categories/ai/", "/categories/cybersecurity/", "/categories/programming/", "/categories/cloud/", "/categories/web-data/"],
      "Utility Pages": ["/about/", "/methodology/", "/authors/", "/contact/", "/crawler-view/", "/case-study/"],
      "Robots Traps (RFC 9309)": ["/drafts/crawler-test.html", "/internal/crawler-notes.html"],
      "Articles Sample": [
        "/articles/ai/what-is-machine-learning/",
        "/articles/cybersecurity/encryption-basics/",
        "/articles/programming/data-structures/",
        "/articles/cloud/cloud-computing/",
        "/articles/web-data/web-crawling/",
        "/articles/web-data/robots-protocol/"
      ]
    };

    let html = '';
    for (const [groupName, urls] of Object.entries(groups)) {
      html += `<div class="sim-tree-group">`;
      html += `<div class="sim-tree-category"><i class="fa-regular fa-folder-open"></i> ${groupName}</div>`;
      urls.forEach(url => {
        let statusClass = 'pending';
        let statusIcon = '<i class="fa-regular fa-circle"></i>';
        let statusLabel = 'Idle';

        if (blockedSet.has(url)) {
          statusClass = 'blocked';
          statusIcon = '<i class="fa-solid fa-lock"></i>';
          statusLabel = 'Blocked';
        } else if (visitedSet.has(url)) {
          statusClass = 'visited';
          statusIcon = '<i class="fa-solid fa-check-circle"></i>';
          statusLabel = '200 OK';
        } else if (enqueuedSet.has(url)) {
          statusClass = 'queued';
          statusIcon = '<i class="fa-solid fa-spinner fa-spin"></i>';
          statusLabel = 'Queued';
        }

        const data = SITE_GRAPH[url] || { title: url };
        html += `
          <div class="sim-tree-node ${statusClass}" title="${data.title}">
            <span class="sim-tree-node-title">${statusIcon} ${url}</span>
            <span class="sim-tree-node-tag">${statusLabel}</span>
          </div>
        `;
      });
      html += `</div>`;
    }
    dom.tree.innerHTML = html;
  }

  function step() {
    if (queue.length === 0) {
      stopSimulation();
      if (dom.statusText) {
        dom.statusText.innerHTML = `<strong>Crawl Finished!</strong> FIFO queue exhausted. Discovered ${visitedSet.size} pages, avoided ${duplicateCount} duplicate links, intercepted ${blockedSet.size} robots violations.`;
      }
      appendLog(`[COMPLETE] Crawl run finished. All accessible nodes visited.`, 'ok');
      return;
    }

    stepCount++;
    const current = queue.shift();
    const url = current.url;

    // Check robots.txt Disallow
    if (checkRobotsDisallowed(url)) {
      blockedSet.add(url);
      visitedSet.add(url);
      updateMetrics();
      renderQueue();
      renderTree();

      if (dom.statusText) {
        dom.statusText.innerHTML = `<strong>ROBOTS DISALLOWED:</strong> Blocked <code>${url}</code> via RFC 9309 rule (Disallow: /drafts/, /internal/).`;
      }
      appendLog(`[ROBOTS 🔒] <span style="color:#f87171;">BLOCKED</span>: <code>${url}</code> disallowed by root /robots.txt. HTTP fetch skipped!`, 'blocked');
      return;
    }

    // Mark as visited (200 OK)
    visitedSet.add(url);
    const node = SITE_GRAPH[url] || { title: 'Unknown Page', links: [] };

    if (dom.statusText) {
      dom.statusText.innerHTML = `<strong>FETCHED:</strong> <code>${url}</code> (Depth ${current.depth}) · HTTP 200 OK · Scanning outgoing hyperlinks...`;
    }
    appendLog(`[HTTP 200] Fetched: <strong>${url}</strong> (Depth: ${current.depth}) - "${node.title}"`, 'ok');

    // Extract links
    let newEnqueued = 0;
    let localDupes = 0;

    (node.links || []).forEach(target => {
      if (enqueuedSet.has(target) || visitedSet.has(target)) {
        duplicateCount++;
        localDupes++;
      } else {
        enqueuedSet.add(target);
        queue.push({
          url: target,
          depth: current.depth + 1,
          source: url
        });
        newEnqueued++;
      }
    });

    if (newEnqueued > 0 || localDupes > 0) {
      appendLog(`  ↳ Links parsed: ${newEnqueued} new enqueued (Depth ${current.depth + 1}), ${localDupes} duplicate links skipped via seen=set()`, 'dim');
    }

    updateMetrics();
    renderQueue();
    renderTree();
  }

  function startSimulation() {
    if (isRunning) return;
    isRunning = true;
    if (dom.playBtn) {
      dom.playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
      dom.playBtn.classList.add('active');
    }
    appendLog(`[RUN] Crawler loop active. Polling FIFO queue at ${delayMs}ms delay...`, 'info');

    function loop() {
      if (!isRunning) return;
      step();
      if (queue.length > 0 && isRunning) {
        timerId = setTimeout(loop, delayMs);
      } else {
        stopSimulation();
      }
    }
    loop();
  }

  function stopSimulation() {
    isRunning = false;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    if (dom.playBtn) {
      dom.playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Run Simulation';
      dom.playBtn.classList.remove('active');
    }
  }

  function resetSimulation() {
    stopSimulation();
    queue = [{ url: "/", depth: 0, source: "seed" }];
    enqueuedSet = new Set(["/"]);
    visitedSet = new Set();
    blockedSet = new Set();
    duplicateCount = 0;
    stepCount = 0;

    if (dom.terminal) {
      dom.terminal.innerHTML = '';
    }
    appendLog(`[RESET] Crawler engine reset to seed URL: https://techsphere.domain/`, 'info');
    appendLog(`[ROBOTS] RFC 9309 parser loaded rules: Disallow /drafts/, Disallow /internal/`, 'dim');
    appendLog(`[QUEUE] Enqueued seed "/" at Depth 0 into collections.deque`, 'info');

    if (dom.statusText) {
      dom.statusText.innerHTML = `Ready to start. Seed URL <strong>https://techsphere.domain/</strong> enqueued at Depth 0.`;
    }

    updateMetrics();
    renderQueue();
    renderTree();
  }

  function updateSpeed() {
    if (!dom.speedSelect) return;
    const val = dom.speedSelect.value;
    if (val === 'slow') delayMs = 1200;
    else if (val === 'fast') delayMs = 200;
    else delayMs = 600;
  }

  function attachListeners() {
    if (dom.playBtn) {
      dom.playBtn.addEventListener('click', () => {
        if (isRunning) stopSimulation();
        else startSimulation();
      });
    }

    if (dom.stepBtn) {
      dom.stepBtn.addEventListener('click', () => {
        stopSimulation();
        step();
      });
    }

    if (dom.resetBtn) {
      dom.resetBtn.addEventListener('click', resetSimulation);
    }

    if (dom.speedSelect) {
      dom.speedSelect.addEventListener('change', updateSpeed);
    }

    if (dom.robotsToggle) {
      dom.robotsToggle.addEventListener('change', () => {
        const obeys = dom.robotsToggle.checked;
        appendLog(`[CONFIG] Obey robots.txt toggled to: <strong>${obeys ? 'TRUE (RFC 9309 enfored)' : 'FALSE (Bypass traps)'}</strong>`, obeys ? 'ok' : 'blocked');
      });
    }
  }

  // Bootstrapping
  function init() {
    initDOM();
    attachListeners();
    updateSpeed();
    resetSimulation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
