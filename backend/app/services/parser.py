# parser.py
# Service d'extraction de texte brut depuis les fichiers CV (PDF et Word).
# Le texte extrait sera ensuite envoyé au LLM pour analyse.

import pdfplumber
import docx
import io

#  Fonction principale 

def extract_text(content: bytes, content_type: str) -> str:
    # Détecte le format du fichier et appelle la bonne méthode d'extraction
    try:
        if content_type == "application/pdf":
            return _extract_from_pdf(content)
        elif "wordprocessingml" in content_type:
            return _extract_from_docx(content)
    except Exception as e:
        print(f"Erreur extraction texte : {e}")
    return ""

#  Extraction PDF 

def _extract_from_pdf(content: bytes) -> str:
    # Parcourt toutes les pages du PDF et concatène le texte
    text = ""
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text.strip()

#  Extraction Word

def _extract_from_docx(content: bytes) -> str:
    # Parcourt tous les paragraphes du document Word et concatène le texte
    doc = docx.Document(io.BytesIO(content))
    return "\n".join([para.text for para in doc.paragraphs if para.text]).strip()