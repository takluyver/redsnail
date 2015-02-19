deps:
	rm -r pypkgs/
	pip install -t pypkgs -r pypi_deps.txt
	rm -r pypkgs/*.egg-info
	bower install
