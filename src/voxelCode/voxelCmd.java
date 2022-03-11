package voxelCode;

import java.util.*;

class voxelCmd implements command {
	
	private Float x,y,z;
	private Integer r,g,b;
	private voxel vox;
	private builder parentBuilder;
	
	
	voxelCmd(float x, float y, float z, builder parentBuilder) {
		this(x, y, z, 255.0f, 255.0f, 255.0f, parentBuilder);
	}
	
	voxelCmd(float x, float y, float z, float r, float g, float b, builder parentBuilder) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.r = Math.round(r);
		this.g = Math.round(g);
		this.b = Math.round(b);
		this.parentBuilder = parentBuilder;
		
		genVoxels();
	}

	private void genVoxels() {
		//Only gen a single voxel for this class...
		vox = new voxel(x,y,z, r,g,b, this);
	}
	
	@Override
	public builder getBuilder() {
		return this.parentBuilder;
	}
	
	@Override
	public int getVoxelCount() {
		if(vox != null) {
			return 1;
		}
		return 0;
	}

	@Override
	public float[][] getVoxelPosits() {
		if(vox != null) {
			float[][] posits = new float[][] {vox.getPos()};
			return posits;
		}
		return new float[][]{};
	}

	
	@Override
	public void removeLocalInsideTriangles() {
		return; //These are no local inside triangles if there is only one voxel...
	}
	

	@Override
	public void removeGlobalInsideTriangles(float[][] voxPosits) {
		if(vox != null) {
			int length = voxPosits.length;
			for(int i=0; i< length; i++) {
				vox.checkInsideTriangles(voxPosits[i]);
			}
		}
	}

	@Override
	public void deleteDuplicateVoxels(float[][] voxPosits) {
		if(vox != null) {
			int length = voxPosits.length;
			for(int i=0; i< length; i++) {
				if(vox.checkXYZ(voxPosits[i])) { //If the voxels share the same position delete this voxel...
					vox = null;
				}
			}
		}
	}

	@Override
	public List<List<Float>> exportVerticesData() {
		if(vox != null) {
			return vox.exportVerticesData();
		}
		return new ArrayList<List<Float>>(); //Else return an empty list...
	}

	@Override
	public List<List<Integer>> exportTriangleData(int offset) {
		if(vox != null) {
			return vox.exportTriangleData(offset);
		}
		return new ArrayList<List<Integer>>();
	}

	@Override
	public List<List<Float>> exportNormalData() {
		if(vox != null) {
			return vox.exportNormalData();
		}
		return new ArrayList<List<Float>>();
	}

	@Override
	public List<Integer> exportColorData() {
		if(vox != null) {
			return vox.exportColorData();
		}
		return new ArrayList<Integer>();
	}

}
