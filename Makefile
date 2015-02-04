deps:
	pip install -t . -r pypi_deps.txt
	rm -r *.egg-info
	bower install
