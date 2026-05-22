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
    except ValueError as e:
        # Erreurs métier connues (fichier vide, scanné, corrompu)
        raise e
    except Exception as e:
        print(f"Erreur extraction texte : {e}")
    return ""

#  Extraction PDF 

def _extract_from_pdf(content: bytes) -> str:
    # Vérifie que le contenu n'est pas vide
    if not content or len(content) == 0:
        raise ValueError("Le fichier PDF est vide")

    try:
        text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            # Vérifie que le PDF a au moins une page
            if len(pdf.pages) == 0:
                raise ValueError("Le fichier PDF ne contient aucune page")

            for page in pdf.pages:
                text += page.extract_text() or ""

        # Vérifie que du texte a été extrait
        if not text.strip():
            raise ValueError(
                "Aucun texte extrait du PDF. "
                "Le fichier est peut-être scanné (image) et nécessite un OCR."
            )

        return text.strip()

    except ValueError:
        raise
    except Exception:
        raise ValueError("Le fichier PDF est corrompu ou dans un format non supporté")

#  Extraction Word 

def _extract_from_docx(content: bytes) -> str:
    # Vérifie que le contenu n'est pas vide
    if not content or len(content) == 0:
        raise ValueError("Le fichier Word est vide")

    try:
        doc = docx.Document(io.BytesIO(content))
        text = "\n".join([para.text for para in doc.paragraphs if para.text]).strip()

        if not text:
            raise ValueError("Le fichier Word ne contient aucun texte")

        return text

    except ValueError:
        raise
    except Exception:
        raise ValueError("Le fichier Word est corrompu ou dans un format non supporté")