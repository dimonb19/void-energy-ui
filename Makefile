# Makefile for running Astro Svelte application with variables

PKG_MGR ?= npm

install:
	$(PKG_MGR) install

dev:
	$(PKG_MGR) run dev

build:
	$(PKG_MGR) run build

format: 
	$(PKG_MGR) run format

preview:
	$(PKG_MGR) run preview

check:
	$(PKG_MGR) run check

scan:
	$(PKG_MGR) run scan

test:
	$(PKG_MGR) run test

tokens:
	$(PKG_MGR) run build:tokens

clean:
	rm -rf node_modules .astro dist

.PHONY: install dev build format check scan test tokens preview clean