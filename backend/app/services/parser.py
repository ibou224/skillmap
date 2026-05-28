# parser.py
# Service d'extraction de texte brut depuis les fichiers CV (PDF et Word).
# Le texte extrait sera ensuite envoyé au LLM pour analyse.

import pdfplumber
import docx
import io

# ── Signatures magic bytes ────────────────────────────────────────────────────
# Le content_type vient du client et peut être falsifié.
# On vérifie les premiers octets du fichier (magic bytes) pour s'assurer
# que le contenu correspond réellement au format déclaré.

_PDF_MAGIC  = b"%PDF"       # Tout PDF commence par %PDF
_DOCX_MAGIC = b"PK\x03\x04" # DOCX = archive ZIP → commence par PK♥♦

def _validate_magic_bytes(content: bytes, content_type: str) -> None:
    """
    Lève ValueError si la signature du fichier ne correspond pas au content_type.
    """
    if content_type == "application/pdf":
        if not content.startswith(_PDF_MAGIC):
            raise ValueError(
                "Le fichier n'est pas un PDF valide. "
                "Vérifiez que le fichier n'a pas été renommé."
            )
    elif "wordprocessingml" in content_type:
        if not content.startswith(_DOCX_MAGIC):
            raise ValueError(
                "Le fichier n'est pas un document Word (.docx) valide. "
                "Vérifiez que le fichier n'a pas été renommé."
            )

# ── Fonction principale ───────────────────────────────────────────────────────

def extract_text(content: bytes, content_type: str) -> str:
    # Valide la signature avant toute extraction
    _validate_magic_bytes(content, content_type)

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