# KnowBridge — Backend API Integration Guide
**For: Krisha (Backend Lead)**  
**From: Tithi (Database & AI Engine Lead)**

The AI Memory Engine is located at `services/memoryEngine.js`. You can import it directly into your Express routes.

---

## 1. Import the Engine in your Express App

```javascript
const memoryEngine = require('./services/memoryEngine');
const Memory = require('./models/Memory');
```

---

## 2. Express Route Implementations

### A. Extract Decisions from Chat/Text
**Endpoint:** `POST /api/memories/extract`
```javascript
// Analyzes meeting notes or chat and returns structured decisions
// Discards casual conversation automatically
router.post('/api/memories/extract', async (req, res) => {
  try {
    const { text, source } = req.body;
    const extracted = await memoryEngine.extractMemories(text, source);
    res.json({ success: true, count: extracted.length, data: extracted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### B. Save New Memory (Generates Vector Embedding Automatically)
**Endpoint:** `POST /api/memories`
```javascript
router.post('/api/memories', async (req, res) => {
  try {
    const { title, content, category, source, workspace, tags, expires_at } = req.body;
    const saved = await memoryEngine.saveMemory({
      title,
      content,
      category,
      source,
      workspace: workspace || 'default',
      tags,
      expires_at,
    });
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### C. Ask Question (Context-Aware Q&A + Memory Citations)
**Endpoint:** `POST /api/chat`
```javascript
router.post('/api/chat', async (req, res) => {
  try {
    const { question, workspace } = req.body;
    const response = await memoryEngine.askQuestion(question, workspace || 'default');
    // Returns: { question, answer, memoriesCited: [...] }
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### D. Check for Conflicts (Before Saving)
**Endpoint:** `POST /api/memories/check-conflict`
```javascript
router.post('/api/memories/check-conflict', async (req, res) => {
  try {
    const { title, content, workspace } = req.body;
    const conflictResult = await memoryEngine.detectConflict(
      { title, content },
      workspace || 'default'
    );
    // Returns: { hasConflict: boolean, conflictingMemory, reason, recommendedAction }
    res.json({ success: true, data: conflictResult });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### E. Supersede Memory (Correction & History Preservation)
**Endpoint:** `PUT /api/memories/:id/supersede`
```javascript
router.put('/api/memories/:id/supersede', async (req, res) => {
  try {
    const oldMemoryId = req.params.id;
    const newMemoryData = req.body;
    const result = await memoryEngine.supersedeMemory(oldMemoryId, newMemoryData);
    // Returns: { deprecatedMemory, activeMemory }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### F. List All Memories (For Dashboard)
**Endpoint:** `GET /api/memories`
```javascript
router.get('/api/memories', async (req, res) => {
  try {
    const workspace = req.query.workspace || 'default';
    const status = req.query.status || 'active'; // 'active' or 'deprecated'
    const memories = await Memory.find({ workspace, status }).sort({ createdAt: -1 });
    res.json({ success: true, count: memories.length, data: memories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```
