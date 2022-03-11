/*
* Made by Rhett Thompson. ©2019 Rhett Thompson
*	V 1.0
*   Ported from my Javascript version: https://github.com/kippllo/VoxelCode
*/

package voxelCode;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.file.*;
import java.util.*;
import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.Color;
import java.awt.image.*;

public class builder {
	private List<String> input;
	private String filename;
	private Boolean grid;
	private List<List<Integer>> colorArray;
	private List<command> commands;
	
	builder () {
		input = new ArrayList<String>();
		filename = "voxel";
		grid = true;
		colorArray = new ArrayList<List<Integer>>();
		commands = new ArrayList<command>();
	}
	
	
	boolean getGrid() {
		return grid;
	}
	
	List<List<Integer>> getColorArray() {
		return colorArray;
	}
	
	protected void addColor(List<Integer> rgb) {
		colorArray.add(rgb);
	}
	
	private void readFile(String path) throws IOException {
		File inputFile = new File(path);
		Scanner scannedFile = new Scanner(inputFile);
		scannedFile.useDelimiter("\n");
		input = new ArrayList<String>();
		
		while(scannedFile.hasNext()) {
			input.add(scannedFile.next());
		}
		
		scannedFile.close();
	}
	
	public void printHelp(boolean errTrue, String errMessage){

        if(errTrue){
            System.out.print("\nError: " + errMessage + "\n");
        }

        System.out.print("\nUsage:" + "    voxelCode input_file_path [export_file_type] [convert_PNG]\n\n");
        System.out.print("    input_file_path" + "    Path to voxel source code file. \n        (Preferred file type is \".vc\" but any extension will work.) \n        For documentation see: https://kippllo.github.io/VoxelCode/html/documentation/doc.html\n\n");
        System.out.print("    export_file_type" + "    Supported export types: \"obj\" or \"stl\" (default is \"obj\").\n\n");
        System.out.print("    convert_PNG" + "    Supports PNG conversion: \"convert\" (e.g. \"voxelCode pic.png convert\")\n" + "        This will produce an output \".vc\" file named the same thing as the base PNG. \n        This file will contain the voxelCode source for the converted PNG. \n        Feed this file back into the compiler if you want the 3D model: \"voxelCode pic.vc obj\" \n        Note: transparent pixels in the PNG will not be rendered as voxels. \n\n");
    }
	
	private List<Float> getParamNumbers(String paramStr){
		List<Float> paramNumbers = new ArrayList<Float>();
		List<String> params = Arrays.asList( paramStr.split(",") );

        int paramsCount = params.size();
        for(int i=0; i < paramsCount; i++){
        	try {
        		float numb = Float.valueOf(params.get(i).split("]")[0]); // Will take care of "5.5]{" and still turn it into: 5.5...
        		paramNumbers.add(numb);
        	} catch(NumberFormatException e) {
        		continue;
        	}
        }
        return paramNumbers;
    }
	
	private void interpret() {
		//Fill up the "commands" variable...
		List<List<String>> linesSplit = new ArrayList<List<String>>();
		
		int linesCount = input.size();
        for(int i=0; i < linesCount; i++){
            linesSplit.add( Arrays.asList(input.get(i).split("\\[") ));
        }
		
		int linesSplitCount = linesSplit.size();
		for(int i=0; i < linesSplitCount; i++) {
			
			if(linesSplit.get(i).get(0).indexOf("*") != -1) { continue; }
			
			else if(linesSplit.get(i).get(0).indexOf("filename:") != -1){
				String tempFileName = linesSplit.get(i).get(0).split(":")[1].trim();
				filename = tempFileName;
            }
			
			else if(linesSplit.get(i).get(0).indexOf("fill") != -1) {
				List<Float> fillParametersNumbers = getParamNumbers(linesSplit.get(i).get(1));
				List<List<Float>> fillElements = new ArrayList<List<Float>>();
				
				for(int n=i+1; linesSplit.get(n).get(0).indexOf("}") == -1; n++){
	                fillElements.add( getParamNumbers(linesSplit.get(n).get(1)) );
	                linesSplit.get(n).set(0, "*");
	            }
				commands.add( new fillCmd(fillParametersNumbers.get(0), fillParametersNumbers.get(1), fillParametersNumbers.get(2), fillParametersNumbers.get(3), fillParametersNumbers.get(4), fillParametersNumbers.get(5), fillElements, this) );
			}
			
            else if(linesSplit.get(i).get(0).indexOf("cube") != -1){
            	List<Float> cubeParametersNumbers = getParamNumbers(linesSplit.get(i).get(1));
            	
            	if(cubeParametersNumbers.size() > 6) { //User passed cube color parameters...
            		commands.add( new cubeCmd(cubeParametersNumbers.get(0), cubeParametersNumbers.get(1), cubeParametersNumbers.get(2), cubeParametersNumbers.get(3), cubeParametersNumbers.get(4), cubeParametersNumbers.get(5), cubeParametersNumbers.get(6), cubeParametersNumbers.get(7), cubeParametersNumbers.get(8), this) );
            	} else {
            		commands.add( new cubeCmd(cubeParametersNumbers.get(0), cubeParametersNumbers.get(1), cubeParametersNumbers.get(2), cubeParametersNumbers.get(3), cubeParametersNumbers.get(4), cubeParametersNumbers.get(5), this) );
            	}
            }
			
            else if(linesSplit.get(i).get(0).indexOf("voxel") != -1) {
            	List<Float> voxelParameters = getParamNumbers(linesSplit.get(i).get(1));
            	
            	if(voxelParameters.size() > 3) { //User passed cube color parameters...
            		commands.add( new voxelCmd(voxelParameters.get(0), voxelParameters.get(1), voxelParameters.get(2), voxelParameters.get(3), voxelParameters.get(4), voxelParameters.get(5), this) );
            	} else {
            		commands.add( new voxelCmd(voxelParameters.get(0), voxelParameters.get(1), voxelParameters.get(2), this) );
            	}
            }
			
            else if( linesSplit.get(i).get(0).indexOf("grid:off") != -1 || linesSplit.get(i).get(0).indexOf("grid: off") != -1 ){
				grid = false;
            }
			
            else if( linesSplit.get(i).get(0).indexOf("grid:on") != -1 || linesSplit.get(i).get(0).indexOf("grid: on") != -1 ){
				grid = true;
            }
			
		}
	}
	
	public void compile(String path, String fileType) {
		List<List<Float>> verticesData = new ArrayList<List<Float>>();
		List<List<Float>> verticesCheckData = new ArrayList<List<Float>>();
		List<List<Integer>> triangleData = new ArrayList<List<Integer>>();
		List<List<Float>> normalData  = new ArrayList<List<Float>>();
		List<Integer> colorData = new ArrayList<Integer>();
		
		try {
			readFile(path);
		} catch(IOException e) {
			printHelp(true, e.getLocalizedMessage());
			return; //Exit compile early.
		}
		
		interpret();
		
		int commandsCount = commands.size();
		for(int i=0; i<commandsCount; i++) {
			//For every command compare it to the other command's voxels...
			
			for(int n=0; n<commandsCount; n++) {
				if(i != n) {
					commands.get(i).deleteDuplicateVoxels(commands.get(n).getVoxelPosits());
				}
			}
		}
		
		int triangleOffset=0;
		for(int i=0; i<commandsCount; i++) { //Can't be the same for-loop or "removeGlobalInsideTriangles" will remove too many triangles...
			for(int n=0; n<commandsCount; n++) {
				if(i != n) {
					commands.get(i).removeGlobalInsideTriangles(commands.get(n).getVoxelPosits());
				}
			}
			commands.get(i).removeLocalInsideTriangles();
			
			//Get export data...
			verticesData.addAll(commands.get(i).exportVerticesData());
			verticesCheckData.addAll(commands.get(i).exportVerticesData()); //Make a second copy of the vertices data so we can have an unmodified version of the data...
			
			
			triangleData.addAll(commands.get(i).exportTriangleData( triangleOffset ));
			triangleOffset += commands.get(i).getVoxelCount();
			
			normalData.addAll(commands.get(i).exportNormalData());
			colorData.addAll(commands.get(i).exportColorData());
		}
		
		//Triangulate/Fix triangles (or vertex welding)...
		int vertListCount = verticesCheckData.size();
        for(int v1=vertListCount-1; v1>=0; v1--){ //Reverse for-loop for I can delete the current index at each iteration and not mess up the loop's progression.

            int vertListReCount = verticesCheckData.size(); //The size will be changing because verts near the end are removed every loop...
            for(int v2=0; v2<vertListReCount; v2++){
                if(v1 != v2){ //If they are not the same vertex. This check is based on index position.
                	if( Arrays.equals(verticesCheckData.get(v1).toArray(), verticesCheckData.get(v2).toArray()) ) { //If the vertices have the same xyz position... 
                        //Replace in triangle array...
                        int triListCount = triangleData.size();
                        for(int t=0; t<triListCount; t++){
                            //If the triangle's first point is the same as the first vertex, change the triangle to use the second vertex. Same thing for the next two triangle points.
                        	triangleData.get(t).set(0, (triangleData.get(t).get(0) == v1) ? v2 : triangleData.get(t).get(0) );
                        	triangleData.get(t).set(1, (triangleData.get(t).get(1) == v1) ? v2 : triangleData.get(t).get(1) );
                        	triangleData.get(t).set(2, (triangleData.get(t).get(2) == v1) ? v2 : triangleData.get(t).get(2) );
                        }
                    }
                }
            }
            verticesCheckData.remove(v1);
        }
        
        //Export to the correct file...
        if(fileType == "stl") {
        	try {
        		exportStl(verticesData, triangleData, normalData);
        		System.out.println("Export Successful!");
        	} catch(IOException e) {
        		System.out.print("\nError exporting file: " + e.getLocalizedMessage() + "\n");
        	}
        } else if(fileType == "obj") {
        	try {
        		exportObjData(verticesData, triangleData, normalData, colorArray, colorData);
        		System.out.println("Export Successful!");
        	} catch(IOException e) {
        		System.out.print("\nError exporting file: " + e.getLocalizedMessage() + "\n");
        	}
        }
	}
	
	private void exportStl(List<List<Float>> vertices, List<List<Integer>> triangles, List<List<Float>> normals) throws IOException {
		String data = "solid Default\n";

        int trianglesCount = triangles.size();
        for (int i=0; i<trianglesCount; i++){
            data += "  facet normal " + normals.get(i).get(0) + " " + normals.get(i).get(1) + " " + normals.get(i).get(2) + " " + "\n";
            data += "    outer loop\n";
            data += "      vertex " + vertices.get(triangles.get(i).get(0)).get(0) + " " + vertices.get(triangles.get(i).get(0)).get(1) + " " + vertices.get(triangles.get(i).get(0)).get(2) + " " + "\n";
            data += "      vertex " + vertices.get(triangles.get(i).get(1)).get(0) + " " + vertices.get(triangles.get(i).get(1)).get(1) + " " + vertices.get(triangles.get(i).get(1)).get(2) + " " + "\n";
            data += "      vertex " + vertices.get(triangles.get(i).get(2)).get(0) + " " + vertices.get(triangles.get(i).get(2)).get(1) + " " + vertices.get(triangles.get(i).get(2)).get(2) + " " + "\n";
            data += "    endloop\n";
            data += "  endfacet\n";
        }

        data += "endsolid Default";
        
        List<String> dataList = Arrays.asList(data);
        Path outputFilePath = Paths.get(filename + ".stl");
        Files.write(outputFilePath, dataList, Charset.forName("UTF-8"));
	}
	
	private void exportObjData(List<List<Float>> vertices, List<List<Integer>> triangles, List<List<Float>> normals, List<List<Integer>> colorPalette, List<Integer> triangleColors) throws IOException {
		String data = "";

        data += "g " + filename + "\n";
        data += "mtllib " + filename + ".mtl\n";
        data += "usemtl " + filename + "\n";

        data += "\n\n";

        // Write UV coordinates.
        float colorPaletteCount = colorPalette.size();
        for (int i=0; i<colorPaletteCount; i++){

            float step = (1/colorPaletteCount) * i;
            float offset = (1/colorPaletteCount) - (1/(2*colorPaletteCount));

            data += "vt " + (step + offset) + " 0\n";
        }

        data += "\n\n";

        // Write Vertices
        int verticesCount = vertices.size();
        for (int i=0; i<verticesCount; i++){
            data += "v " + vertices.get(i).get(0) + " " + vertices.get(i).get(1) + " " + vertices.get(i).get(2) + "\n";
        }

        data += "\n\n";

        // Write Normals
        int normalsCount = normals.size();
        for (int i=0; i<normalsCount; i++){
            data += "vn " + normals.get(i).get(0) + " " + normals.get(i).get(1) + " " + normals.get(i).get(2) + "\n";
        }

        data += "\n\n";

        // Write Faces (Triangles)
        // Note: In .obj files the vertex, normals, and UV counts all start at 1 and not 0.
        // This means I have to add 1 to all of these array indexs when writing them to the obj.
        // Face format is: vertex/UV/Normal
        // Normals and UV should just match the triangle in iteration. A.K.A they should just be i+1
        int trianglesCount = triangles.size();
        for (int i=0; i<trianglesCount; i++){
            data += "f " + (triangles.get(i).get(0)+1) + "/" + (triangleColors.get(i)+1) + "/" + (i+1)
            + " " + (triangles.get(i).get(1)+1) + "/" + (triangleColors.get(i)+1) + "/" + (i+1)
            + " " + (triangles.get(i).get(2)+1) + "/" + (triangleColors.get(i)+1) + "/" + (i+1)
            + "\n";
        }

        List<String> dataList = Arrays.asList(data);
        Path outputFilePath = Paths.get(filename + ".obj");
        Files.write(outputFilePath, dataList, Charset.forName("UTF-8"));
        
        //Write .mtl file...
        String mtlData = "newmtl " + filename + " \nmap_Kd " + filename + ".png";
        dataList = Arrays.asList(mtlData);
        outputFilePath = Paths.get(filename + ".mtl");
        Files.write(outputFilePath, dataList, Charset.forName("UTF-8"));
        
        //Write .png file...
        BufferedImage texture = new BufferedImage(Math.round(colorPaletteCount*10),10, BufferedImage.TYPE_INT_RGB);
        Graphics2D draw = texture.createGraphics();
        
        for(int i=0; i<colorPaletteCount; i++){
            Color c = new Color(colorPalette.get(i).get(0), colorPalette.get(i).get(1), colorPalette.get(i).get(2));
            draw.setColor(c);
            draw.fillRect(i*10, 0, (i*10)+10, 10);
        }
        File pngOutput = new File(filename + ".png");
        ImageIO.write(texture, "png", pngOutput);
        
        
    }
	
}
