import os
import re

root_dir = os.path.abspath("src")
errors = []

def resolve_path(current_file, import_path):
    base_dir = os.path.dirname(current_file)
    target_path = os.path.normpath(os.path.join(base_dir, import_path))
    
    # Possible extensions to try
    extensions = ['.ts', '.tsx', '.d.ts', '.js', '.jsx', '.css', '.svg', '.png', '.jpg']
    
    # 1. Check if it's a file exactly as imported (e.g. .css, .svg)
    if os.path.isfile(target_path):
        return True

    # 2. Check if it's a file with extension appended (e.g. import App from './App')
    for ext in extensions:
        if os.path.isfile(target_path + ext):
            return True
            
    # 3. Check if it's a directory containing an index file (e.g. import X from './folder')
    if os.path.isdir(target_path):
        for ext in extensions:
            if os.path.isfile(os.path.join(target_path, 'index' + ext)):
                return True
            
    return False

print(f"Scanning directory: {root_dir}")

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Regex to find import paths: from './path' or import('./path')
                # Matches: from "...", from '...', import("..."), import('...')
                # We mainly care about relative paths starting with .
                patterns = [
                    r'from\s+[\'"](\.[^"\']+)[\'"]',
                    r'import\s*\(\s*[\'"](\.[^"\']+)[\'"]\s*\)',
                    r'import\s+[\'"](\.[^"\']+)[\'"]'
                ]
                
                for pattern in patterns:
                    matches = re.finditer(pattern, content)
                    for match in matches:
                        import_path = match.group(1)
                        if not resolve_path(file_path, import_path):
                            # Calculate line number
                            line_num = content[:match.start()].count('\n') + 1
                            rel_file = os.path.relpath(file_path, os.getcwd())
                            errors.append(f"❌ {rel_file}:{line_num} -> Cannot find module '{import_path}'")

            except Exception as e:
                print(f"Error reading file {file_path}: {e}")

if errors:
    print("\n--- Found Missing Paths ---")
    for e in errors:
        print(e)
    print("---------------------------")
else:
    print("\n✅ All relative paths are valid.")
