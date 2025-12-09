# jscad-to-step

This repo converts [jscad-planner](https://github.com/tscircuit/jscad-planner) objects into STEP files

```bash
bun init -y
rm -rf CLAUDE.md .cursor
npm install -g @tscircuit/plop
plop # biome.json
plop # bunfig.toml
mkdir -p tests/fixtures/
cd tests/fixtures
plop # png-matcher.ts
# modify bunfig.toml to not create a lockfile
# modify .gitignore to ignore bun.lock
mkdir -p .github/workflows
cd .github/workflows
plop # bun-typecheck.yml bun-test.yml bun-pver-release.yml bun-formatcheck.yml
bun add -D @biomejs/biome
```

Figure out how to do a png snapshot test with openscade (as dev dep openccl) pngs for the STEP files

This is already done inside stepts and circuit-json-to-step
