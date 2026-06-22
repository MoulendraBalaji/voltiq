import os
import re
import markdown
from fpdf import FPDF

class MyPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font('helvetica', 'I', 8)
            self.set_text_color(128, 128, 128)
            self.cell(0, 10, 'VoltIQ Platform Technical Documentation', 0, 0, 'R')
            self.ln(10)
            
    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def clean_text(text):
    # Replace LaTeX symbols and custom math notations
    text = text.replace(r'\rightarrow', '->')
    text = text.replace(r'$70\%$', '70%')
    text = text.replace(r'$0\text{ to }100$', '0 to 100')
    
    # Map emojis to text or remove them
    emoji_map = {
        '🏛️': '',
        '🗄️': '',
        '💡': '',
        '🔧': '',
        '🚀': '',
    }
    for emoji, replacement in emoji_map.items():
        text = text.replace(emoji, replacement)
        
    # Standardize other smart quotes or unicode chars to ASCII equivalents
    text = text.replace('➔', '->')
    
    # Filter to only keep Latin-1 characters to prevent FPDF Unicode Encoding Exception
    cleaned = []
    for char in text:
        try:
            char.encode('latin-1')
            cleaned.append(char)
        except UnicodeEncodeError:
            pass  # skip character if it cannot be encoded in latin-1
            
    return "".join(cleaned)

def convert_md_to_pdf():
    # Read the markdown file
    with open('architecture.md', 'r', encoding='utf-8') as f:
        md_content = f.read()

    # Clean text to fit Latin-1 limitations of standard FPDF Helvetica font
    cleaned_md = clean_text(md_content)

    # Convert Markdown to HTML
    html = markdown.markdown(cleaned_md)
    
    pdf = MyPDF()
    pdf.set_margins(15, 15, 15)
    pdf.add_page()
    pdf.set_font("helvetica", size=10)
    
    # Render HTML
    pdf.write_html(html)
    
    # Save the output
    pdf.output('architecture.pdf')
    print("PDF generation complete: docs/architecture.pdf")

if __name__ == '__main__':
    convert_md_to_pdf()
