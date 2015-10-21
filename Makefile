deps:
	rm -rf pypkgs/
	pip install -t pypkgs -r pypi_deps.txt
	rm -rf pypkgs/*.egg-info
	bower install

batis: deps
	set -e ;\
	VERSION=`python3 -c "import redsnaillib; print(redsnaillib.__version__)"` ;\
	rm -rf build/batis ;\
	mkdir -p build/batis ;\
	cp -r redsnail redsnaillib pypkgs static batis_info build/batis/ ;\
	batis pack build/batis -n redsnail -o redsnail-$$VERSION.app.tgz ;\

