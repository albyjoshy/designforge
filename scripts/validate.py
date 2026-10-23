from pathlib import Path
import json
root = Path(__file__).resolve().parents[1]
tokens = json.loads((root / 'design-system/tokens.json').read_text())
assert tokens['version']
for key, value in tokens['color'].items():
    assert len(value) == 7 and value[0] == '#', (key, value)
    int(value[1:], 16)
assert tokens['breakpoints']['compactMax'] < tokens['breakpoints']['mediumMax'] < tokens['breakpoints']['expandedMin']
for path in ['agent/AGENT.md', 'agent/design-rules.md', 'mcp-server/src/index.ts', 'examples/designforge_theme.dart']:
    assert (root / path).exists(), path
print('DesignForge starter validation passed')
