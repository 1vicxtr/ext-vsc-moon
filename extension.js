const vscode = require('vscode');

function activate(context) {

    // --- 1. PROVEEDOR DE AUTOCOMPLETADO (CORREGIDO) ---
    const completionProvider = vscode.languages.registerCompletionItemProvider('moon', {
        provideCompletionItems(document, position) {
            const visualHtmlTags = [
                'div', 'p', 'span', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
                'form', 'input', 'textarea', 'button', 'label', 'select', 'option',
                'section', 'article', 'header', 'footer', 'nav', 'aside', 'main',
                'figure', 'figcaption', 'video', 'audio', 'canvas', 'svg'
            ];
            
            const linePrefix = document.lineAt(position).text.substring(0, position.character);
            const openBracketIndex = linePrefix.lastIndexOf('<');

            return visualHtmlTags.map(tag => {
                const snippetCompletion = new vscode.CompletionItem(tag, vscode.CompletionItemKind.Keyword);
                const wordMatch = linePrefix.substring(openBracketIndex + 1);
                
                // Si el usuario ha empezado a escribir una etiqueta después de '<'
                if (openBracketIndex !== -1 && tag.startsWith(wordMatch)) {
                    const startPosition = new vscode.Position(position.line, openBracketIndex);
                    const range = new vscode.Range(startPosition, position);
                    snippetCompletion.range = range;
                    snippetCompletion.insertText = new vscode.SnippetString(`<${tag}>$1</${tag}>`);
                } else {
                    // Comportamiento normal si no se escribe '<' o no coincide
                    snippetCompletion.insertText = new vscode.SnippetString(`<${tag}>$1</${tag}>`);
                }
                
                snippetCompletion.documentation = new vscode.MarkdownString(`Inserta la etiqueta \`<${tag}>\`.`);
                return snippetCompletion;
            });
        }
    });
    context.subscriptions.push(completionProvider);

    // --- 2. PROVEEDOR DE FORMATEO DE DOCUMENTO (MANUAL O AL GUARDAR) ---
    const formattingProvider = vscode.languages.registerDocumentFormattingEditProvider('moon', {
        provideDocumentFormattingEdits(document) {
            const edits = [];
            let indentLevel = 0;
            const indentSize = 4;

            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                if (line.isEmptyOrWhitespace) continue;

                const lineText = line.text.trim();

                if (lineText.startsWith('</')) {
                    indentLevel = Math.max(0, indentLevel - 1);
                }

                const indent = ' '.repeat(indentLevel * indentSize);
                const newText = indent + lineText;

                if (newText !== line.text) {
                    edits.push(vscode.TextEdit.replace(line.range, newText));
                }
               
                if (lineText.startsWith('<') && !lineText.startsWith('</') && !lineText.endsWith('/>')) {
                    indentLevel++;
                }
            }
            return edits;
        }
    });
    context.subscriptions.push(formattingProvider);
    
    // --- 3. PROVEEDOR DE INDENTACIÓN AUTOMÁTICA (AL PRESIONAR ENTER) ---
    const onTypeFormattingProvider = vscode.languages.registerDocumentOnTypeFormattingEditProvider('moon', {
        provideOnTypeFormattingEdits(document, position, ch, options) { /*...*/ }
    }, '\n');
    context.subscriptions.push(onTypeFormattingProvider);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};