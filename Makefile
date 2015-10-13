deps:
	rm -rf pypkgs/
	pip install -t pypkgs -r pypi_deps.txt
	rm -rf pypkgs/*.egg-info
	bower install

batis: deps
	set -e ;\
	VERSION=`python3 -c "import redsnaillib; print(redsnaillib.__version__)"` ;\
	rm -rf build/redsnail ;\
	mkdir -p build/redsnail ;\
	cp -r redsnail redsnaillib pypkgs static batis_info build/redsnail/ ;\
	cd build/ && tar -cvzf ../redsnail_$$VERSION.app.tar.gz redsnail ;\

