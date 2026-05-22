const { PDFParse } = require('pdf-parse');

module.exports = async function parse(buffer) {
    const parser = new PDFParse({ data: buffer });
    try {
        const result = await parser.getText();
        return { text: result.text };
    } finally {
        await parser.destroy();
    }
};
