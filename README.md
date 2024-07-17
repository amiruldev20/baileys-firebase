[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#table-of-contents)
# Baileys Session (Mysql)
> multi session baileys created on mysql databases

[JOIN GROUP](https://chat.whatsapp.com/JbzMsezhCwUKdC6dnjwcIz)

## how to use ?
> First, you need to add the session package in package.json. You can use the github or npm version

**version github**
```json
"session": "github.com/amiruldev20/baileys-session#mysql"
```

**version npm**
```json
"session": "npm:baileys-mysql"
```

```json
{
    "name": "myproject",
    "version": "1.0.1",
    "author": "sanzydev",
    "dependencies": {
        "session": "github:amiruldev20/baileys-session#mysql"
        // and other your depen
    }
}
```

> Second step, please call the useMongoAuthState function on your client. Example code is below

```javascript
// for esm import
import { useSqlAuthState } from "session"

// for cjs import
const { useSqlAuthState } = require("session")

// next code (support all)
const mysqlURI = 'mysql://user:password@host:port/databasename';
const { state, saveCreds, clear, removeCreds, query } = await useSqlAuthState(mysqlURI, {})
```

**Note:**
> If there are bugs, please report & open an issue in the main repo.
