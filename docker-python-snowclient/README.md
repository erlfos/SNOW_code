# README.md
## Usage
Start with a shell, mount volume
```
 docker build -t snow_get_sites .
 docker create -it --rm -v $(pwd)/files:/python-files --name snow_get_sites snow_get_sites
 docker start snow_get_sites
 docker exec -it snow_get_sites bash
 docker build -t snow_get_sites . && docker create -it --rm -v $(pwd)/files:/python-files --name snow_get_sites snow_get_sites && docker start snow_get_sites && docker exec -it snow_get_sites bash
```
