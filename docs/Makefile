# Makefile para a documentacao tecnica do Void Descent
#
# Uso:
#   make all      - regenera diagramas e compila o PDF final
#   make diagrams - so re-renderiza os diagramas (.puml -> .png)
#   make pdf      - so recompila o documento (assume diagramas prontos)
#   make clean    - remove artefatos auxiliares
#   make distclean - remove tudo, inclusive PNGs

PUML_SRC := $(wildcard diagrams/*.puml)
PNG_OUT := $(PUML_SRC:.puml=.png)

LATEXMK := latexmk -pdf -interaction=nonstopmode -halt-on-error

.PHONY: all diagrams pdf clean distclean

all: diagrams pdf

diagrams: $(PNG_OUT)

diagrams/%.png: diagrams/%.puml
	plantuml -tpng -Sdpi=180 $<

pdf: main.pdf

main.pdf: main.tex chapters/*.tex $(PNG_OUT)
	$(LATEXMK) main.tex

clean:
	$(LATEXMK) -c main.tex 2>/dev/null || true
	rm -f *.aux *.log *.toc *.lof *.out *.fdb_latexmk *.fls *.synctex.gz
	rm -f chapters/*.aux

distclean: clean
	rm -f main.pdf
	rm -f diagrams/*.png
