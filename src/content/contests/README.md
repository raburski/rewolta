# System Konkursów

Ten katalog zawiera pliki markdown z informacjami o konkursach organizowanych przez Architektoniczną Rewoltę.

## Struktura pliku konkursu

Każdy plik konkursu powinien mieć następującą strukturę:

```markdown
---
title: "Tytuł konkursu"
description: "Krótki opis konkursu"
startDate: "YYYY-MM-DD"
endDate: "YYYY-MM-DD"
status: "active|upcoming|past"
facebookPost: "https://www.facebook.com/groups/691257419756556/posts/1234567890123456/" (opcjonalne)
---

# Treść konkursu w markdown

## Sekcje

Możesz używać standardowych elementów markdown:
- Nagłówki (# ## ###)
- Listy (- * 1. 2.)
- **Pogrubienie**
- *Kursywa*
- [Linki](url)
- Obrazy ![alt](src)

## Statusy konkursów

- `active` - konkurs aktualnie trwa
- `upcoming` - konkurs planowany na przyszłość
- `past` - konkurs zakończony

## Pola frontmatter

- `title` - tytuł konkursu (wymagane)
- `description` - krótki opis konkursu (wymagane)
- `startDate` - data rozpoczęcia konkursu w formacie YYYY-MM-DD (wymagane)
- `endDate` - data zakończenia konkursu w formacie YYYY-MM-DD (wymagane)
- `status` - status konkursu: active, upcoming, past (wymagane)
- `facebookPost` - link do posta na Facebooku (opcjonalne)

## Nazewnictwo plików

Pliki powinny mieć nazwy w formacie kebab-case:
- `photo-details.md`
- `urban-spaces-2023.md`
- `architectural-competition.md`

## Przykłady

- `photo-details.md` - aktywny konkurs fotograficzny
- `urban-spaces-2023.md` - zakończony konkurs urbanistyczny

## Dodawanie nowego konkursu

1. Utwórz nowy plik `.md` w tym katalogu
2. Dodaj frontmatter z wymaganymi polami
3. Napisz treść konkursu w markdown
4. Zapisz plik - automatycznie pojawi się na stronie konkursów 