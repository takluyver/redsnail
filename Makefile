deps:
	rm -rf pypkgs/
	pip install -t pypkgs -r pypi_deps.txt
	rm -rf pypkgs/*.egg-info
	bower install
