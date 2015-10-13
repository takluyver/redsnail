deps:
	rm -rf pypkgs/
	pip install -t pypkgs -r pypi_deps.txt
	rm -rf pypkgs/*.egg-info
	bower install

batis: deps
	rm -rf build/batis
	mkdir -p build/batis
	cp -r redsnail redsnaillib pypkgs static batis_info build/batis/
	cd build/ && tar -cvzf ../redsnail_0.1.app.tar.gz batis
