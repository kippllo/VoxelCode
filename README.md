# VoxelCode
A script-based voxel editor.

This VoxelCode Java port is reworked to follow OOP and runs as a command-line application.

# How to use
To use VoxelCode simply provide it the path to the source file of the model like:
```cmd
java -jar voxelCode.jar pikachu.txt
```

VoxelCode will output the 3D model file in its current directory.

The default file format is `obj`, but you can specify `stl` to export to that:
```cmd
java -jar voxelCode.jar pikachu.txt stl
```

If you want some pointers on the voxelCode syntax please see here: https://kippllo.github.io/VoxelCode/html/documentation/doc.html

There are also some example files provided with this release in `/examples`.
