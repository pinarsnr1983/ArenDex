const fs = require('fs');
const p = 'dist/index.html';
if (fs.existsSync(p)) {
  let content = fs.readFileSync(p, 'utf8');
  content = content.replaceAll('href="/', 'href="./').replaceAll('src="/', 'src="./');
  fs.writeFileSync(p, content, 'utf8');
  console.log('HTML yolları başarıyla göreceli hale getirildi.');
}
