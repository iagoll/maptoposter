# Server Restructure - src/ Directory

## Changes Made

The server code has been reorganized following Node.js best practices by moving all source code into a `src/` directory.

### Directory Structure

**Before:**
```
server/
├── app.js
├── config/
├── controllers/
├── database/
├── middleware/
├── models/
├── routes/
├── services/
├── package.json
└── ...
```

**After:**
```
server/
├── src/                    # NEW: All source code
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── services/
├── package.json
├── test-api.js
├── README.md
└── ...
```

### Files Updated

#### 1. `package.json`
- Updated `main`: `"app.js"` → `"src/app.js"`
- Updated `start` script: `"node app.js"` → `"node src/app.js"`
- Updated `dev` script: `"nodemon app.js"` → `"nodemon src/app.js"`

#### 2. Path References (all files in src/)

All path references to `python_logic` were updated to go up one additional level:

- **`src/app.js`**
  - `../python_logic/posters` → `../../python_logic/posters`

- **`src/services/posterService.js`**
  - `../../python_logic/venv/bin/python3` → `../../../python_logic/venv/bin/python3`
  - `../../python_logic/create_map_poster.py` → `../../../python_logic/create_map_poster.py`
  - `cwd: ../../python_logic` → `cwd: ../../../python_logic`

- **`src/services/posterGalleryService.js`**
  - `../../python_logic/posters` → `../../../python_logic/posters`

- **`src/services/themeService.js`**
  - `../../python_logic/themes` → `../../../python_logic/themes`

- **`src/database/db.js`**
  - Path already correct: `../../data` (creates `server/data/` directory)

### Files That Stayed in Root

- `package.json` - npm configuration
- `package-lock.json` - dependency lock file
- `.env` - environment variables (not committed)
- `.env.example` - environment template
- `.gitignore` - git ignore rules
- `README.md` - documentation
- `QUICKSTART.md` - quick start guide
- `test-api.js` - API testing utility
- `node_modules/` - dependencies

### Benefits

1. **Standard Structure** - Follows Node.js best practices
2. **Clear Separation** - Source code vs configuration/documentation
3. **Build Ready** - Easy to add build steps (TypeScript, Babel, etc.)
4. **Deploy Friendly** - Can deploy just the `src/` directory
5. **Scalability** - Easier to add more root-level tooling files

### Testing

To verify everything works:

```bash
# Start the server
npm start

# Or with nodemon for development
npm run dev

# Test the API
node test-api.js
```

### Migration Notes for Development

If you have PM2 running, restart with the new path:

```bash
pm2 delete maptoposter-api
pm2 start npm --name "maptoposter-api" -- start
pm2 save
```

### No Breaking Changes

- API endpoints remain the same
- Database location unchanged
- Environment variables unchanged
- All functionality preserved
- Only internal file organization changed

---

**Date:** January 18, 2026  
**Status:** ✅ Complete
