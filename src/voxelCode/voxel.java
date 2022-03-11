package voxelCode;

import java.util.*;
import java.lang.Math;

class voxel {
	private Float x,y,z;
	private Integer r,g,b;
	private List<List<Float>> vertices;
	private List<List<Integer>> triangles;
	private List<List<Float>> normals;
	private Integer colorIndex;
	private List<Integer> triangleColorIndices;
	private command parentCommand;
	private builder grandfatherBuilder;
	
	voxel(float x, float y, float z, command parentCommand) {
		this(x, y, z, 255, 255, 255, parentCommand); //Call main constructor with default colors...
	}
	
	voxel(float x, float y, float z, int r, int g, int b, command parentCommand){
		
		this.parentCommand = parentCommand;
		this.grandfatherBuilder = this.parentCommand.getBuilder();
		
		if(grandfatherBuilder.getGrid()) {
			this.x = (float)Math.round(x);
			this.y = (float)Math.round(y);
			this.z = (float)Math.round(z);
		} else {
			this.x = x;
			this.y = y;
			this.z = z;
		}
		
		this.r = (r < 0) ? 0 : ( (r > 255) ? 255 : r ); //Java has no Clamp, so I made my own...
		this.g = (g < 0) ? 0 : ( (g > 255) ? 255 : g );
		this.b = (b < 0) ? 0 : ( (b > 255) ? 255 : b );
		
		//Check the builder's color array to make sure this voxel's color is inside of it.
		List<Integer> color = new ArrayList<Integer>(); 
		color.addAll(Arrays.asList(this.r,this.g,this.b));
		
		List<List<Integer>> ColorArray = grandfatherBuilder.getColorArray(); //Cached for speed...
		colorIndex = ColorArray.indexOf(color);
		if(colorIndex == -1) {
			grandfatherBuilder.addColor(color);
			colorIndex = ColorArray.size()-1; 
		}
		
		//Fill default values...
		vertices = new ArrayList<List<Float>>();
		vertices.add(Arrays.asList(0.0f, 0.0f, 0.0f));
		vertices.add(Arrays.asList(0.0f, 1.0f, 0.0f));
		vertices.add(Arrays.asList(1.0f, 0.0f, 0.0f));
		vertices.add(Arrays.asList(1.0f, 1.0f, 0.0f));
		vertices.add(Arrays.asList(0.0f, 0.0f, 1.0f));
		vertices.add(Arrays.asList(0.0f, 1.0f, 1.0f));
		vertices.add(Arrays.asList(1.0f, 0.0f, 1.0f));
		vertices.add(Arrays.asList(1.0f, 1.0f, 1.0f));
		
		triangles = new ArrayList<List<Integer>>();
		triangles.add(Arrays.asList(0,1,3)); // Bottom Plain
		triangles.add(Arrays.asList(0,3,2));
		triangles.add(Arrays.asList(7,5,4)); // Top Plain
		triangles.add(Arrays.asList(7,4,6));
		triangles.add(Arrays.asList(5,1,0)); // Left Plain
		triangles.add(Arrays.asList(5,0,4));
		triangles.add(Arrays.asList(7,6,2)); // Right Plain
		triangles.add(Arrays.asList(7,2,3));
		triangles.add(Arrays.asList(6,4,0)); // Front Plain
		triangles.add(Arrays.asList(6,0,2));
		triangles.add(Arrays.asList(7,3,1)); // Back Plain
		triangles.add(Arrays.asList(7,1,5));
		
		normals = new ArrayList<List<Float>>();
		normals.add(Arrays.asList(0.0f, 0.0f, -1.0f)); // Bottom Plain
		normals.add(Arrays.asList(0.0f, 0.0f, -1.0f));
		normals.add(Arrays.asList(0.0f, 0.0f, 1.0f)); // Top Plain
		normals.add(Arrays.asList(0.0f, 0.0f, 1.0f));
		normals.add(Arrays.asList(-1.0f, 0.0f, 0.0f)); // Left Plain
		normals.add(Arrays.asList(-1.0f, 0.0f, 0.0f));
		normals.add(Arrays.asList(1.0f, 0.0f, 0.0f)); // Right Plain
		normals.add(Arrays.asList(1.0f, 0.0f, 0.0f));
		normals.add(Arrays.asList(0.0f, -1.0f, 0.0f)); // Front Plain
		normals.add(Arrays.asList(0.0f, -1.0f, 0.0f));
		normals.add(Arrays.asList(0.0f, 1.0f, 0.0f)); // Back Plain
		normals.add(Arrays.asList(0.0f, 1.0f, 0.0f));
		
		triangleColorIndices = new ArrayList<Integer>();
		triangleColorIndices.addAll(Arrays.asList(colorIndex,colorIndex,colorIndex,colorIndex,colorIndex,colorIndex,colorIndex,colorIndex,colorIndex,colorIndex,colorIndex,colorIndex));
		
		move(this.x, this.y, this.z);
	}
	
	private void move(float xMove, float yMove, float zMove) {
		int vCount = vertices.size();
        for (int i=0; i < vCount; i++){
            vertices.get(i).set(0, vertices.get(i).get(0) + xMove);
            vertices.get(i).set(1, vertices.get(i).get(1) + yMove);
            vertices.get(i).set(2, vertices.get(i).get(2) + zMove);
        }
	}
	
	/*
	private int int2DListIndexOf(List<List<Integer>> v, List<Integer> item){ //remove this...
		
        int ind = -1;
        int Count = v.size();
        for(int i=0; i < Count; i++) {
            if(v.get(i).size() != item.size()) { continue; }

            boolean same = true;
            int itemCount = item.size();
            for(int n=0; n < itemCount; n++){
                if(v.get(i).get(n) != item.get(n)){
                    same = false;
                }
            }

            if(same){
                ind = i;
                break; //return the first instance of "item"'s value.
            }
        }
        return ind;
    }
	*/
	
	public float[] getPos() {
		float[] pos = new float[] {x, y, z};
		return pos;
	}
	
	public void checkInsideTriangles (float[] pos) {
		if(pos[1] == y && pos[2] == z) {
			if(pos[0] == x + 1) {
				int ind = triangles.indexOf(Arrays.asList(7,6,2)); //int2DListIndexOf(triangles, Arrays.asList(7,6,2));
				triangles.remove(ind+1); //added "+1" for clarity. This is equal to: "triangles.remove(ind); triangles.remove(ind);" I want to remove both the item at "ind" and the one after it.
				triangles.remove(ind);
				normals.remove(ind+1);
				normals.remove(ind);
				triangleColorIndices.remove(ind+1);
				triangleColorIndices.remove(ind);
			}
			else if(pos[0] == x - 1) {
				int ind = triangles.indexOf(Arrays.asList(5,1,0)); //int2DListIndexOf(triangles, Arrays.asList(5,1,0));
				triangles.remove(ind+1);
				triangles.remove(ind);
				normals.remove(ind+1);
				normals.remove(ind);
				triangleColorIndices.remove(ind+1);
				triangleColorIndices.remove(ind);
			}
		}
		
		else if(pos[0] == x && pos[2] == z) {
			if(pos[1] == y + 1) {
				int ind = triangles.indexOf(Arrays.asList(7,3,1)); //int2DListIndexOf(triangles, Arrays.asList(7,3,1));
				triangles.remove(ind+1);
				triangles.remove(ind);
				normals.remove(ind+1);
				normals.remove(ind);
				triangleColorIndices.remove(ind+1);
				triangleColorIndices.remove(ind);
			}
			else if(pos[1] == y - 1) {
				int ind = triangles.indexOf(Arrays.asList(6,4,0)); //int2DListIndexOf(triangles, Arrays.asList(6,4,0));
				triangles.remove(ind+1);
				triangles.remove(ind);
				normals.remove(ind+1);
				normals.remove(ind);
				triangleColorIndices.remove(ind+1);
				triangleColorIndices.remove(ind);
			}
		}
		
		else if(pos[0] == x && pos[1] == y) {
			if(pos[2] == z + 1) {
				int ind = triangles.indexOf(Arrays.asList(7,5,4)); //int2DListIndexOf(triangles, Arrays.asList(7,5,4));
				triangles.remove(ind+1);
				triangles.remove(ind);
				normals.remove(ind+1);
				normals.remove(ind);
				triangleColorIndices.remove(ind+1);
				triangleColorIndices.remove(ind);
			}
			else if(pos[2] == z - 1) {
				int ind = triangles.indexOf(Arrays.asList(0,1,3)); //int2DListIndexOf(triangles, Arrays.asList(0,1,3));
				triangles.remove(ind+1);
				triangles.remove(ind);
				normals.remove(ind+1);
				normals.remove(ind);
				triangleColorIndices.remove(ind+1);
				triangleColorIndices.remove(ind);
			}
		}	
	}
	
	public boolean checkXYZ(float[] pos) {
		return Arrays.equals(pos, getPos());
	}
	
	
	public List<List<Float>> exportVerticesData() {
		return vertices;
	}

	public List<List<Integer>> exportTriangleData(int offset) {
		//Return a deep clone of this object's 2D list.
		List<List<Integer>> exportTriangles = new ArrayList<List<Integer>>();
		
		int length = triangles.size();
		for(int i=0; i < length; i++) {
			List<Integer> tri = Arrays.asList(triangles.get(i).get(0) +8*offset, triangles.get(i).get(1) +8*offset, triangles.get(i).get(2) +8*offset);
			exportTriangles.add(tri);
		}
		return exportTriangles;
	}

	public List<List<Float>> exportNormalData() {
		return normals;
	}

	public List<Integer> exportColorData() {
		return triangleColorIndices;
	}
	
}
