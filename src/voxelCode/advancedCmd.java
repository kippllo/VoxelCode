package voxelCode;

import java.util.*;


abstract class advancedCmd implements command {
	
	protected Float xStart,yStart,zStart, xEnd,yEnd,zEnd;
	protected List<voxel> voxels;
	protected builder parentBuilder;
	
	
	advancedCmd(float xStart, float yStart, float zStart, float xEnd, float yEnd, float zEnd, builder parentBuilder) {
		this.xStart = xStart;
		this.yStart = yStart;
		this.zStart = zStart;
		this.xEnd = xEnd;
		this.yEnd = yEnd;
		this.zEnd = zEnd;
		this.parentBuilder = parentBuilder;
		
		this.voxels = new ArrayList<voxel>();
	}
	
	protected abstract void genVoxels();
	
	public final void removeLocalInsideTriangles() { //This needs to be called after "removeGlobalInsideTriangles" is called on this command by other commands! If not it could try to remove the same triangles twice!
		removeGlobalInsideTriangles(getVoxelPosits());
	}
	
	final void deleteLocalDuplicateVoxels() {
		int length = voxels.size();
		
		for(int i=length-1; i>=0; i--) { //Reverse for-loop so I can delete the current index at each iteration and not mess up the loop's progression.			
			
			int lengthNested = voxels.size();
			boolean remove = false;
			for(int n=0; n<lengthNested; n++) {
				if( i != n && voxels.get(i).checkXYZ(voxels.get(n).getPos()) ) { //Can't be the same index (which would be the same voxel!)
					remove = true;
					break; //Escape the loop.
				}
			}
			
			if(remove) {
				voxels.remove(i); //It's okay to remove because of reverse for-loop.
			}
		}
	}
	
	@Override
	public final builder getBuilder() {
		return this.parentBuilder;
	}
	
	@Override
	public int getVoxelCount() {
		return voxels.size();
	}

	@Override
	public final float[][] getVoxelPosits() {
		int length = voxels.size();
		float[][] posits = new float[length][3];
		
		for(int i=0; i<length; i++) {
			posits[i] = voxels.get(i).getPos();
		}
		return posits;
	}


	@Override
	public final void removeGlobalInsideTriangles(float[][] voxPosits) {
		int lengthLocal = voxels.size();
		int lengthParam = voxPosits.length;
		for(int i=0; i< lengthLocal; i++) {
			for(int n=0; n<lengthParam; n++) {
				voxels.get(i).checkInsideTriangles(voxPosits[n]);
			}
		}
	}

	@Override
	public final void deleteDuplicateVoxels(float[][] voxPosits) {
		int lengthLocal = voxels.size();
		int lengthParam = voxPosits.length;
		
		for(int i=lengthLocal-1; i>=0; i--) { //Reverse for-loop so I can delete the current index at each iteration and not mess up the loop's progression.			
			boolean remove = false;
			for(int n=0; n<lengthParam; n++) {
				if(voxels.get(i).checkXYZ(voxPosits[n])) { //If the two voxels are in the same position...
					remove = true;
					break; //Escape the loop.
				}
			}
			
			if(remove) {
				voxels.remove(i); //It's okay to remove because of reverse for-loop.
			}
		}
	}

	@Override
	public final List<List<Float>> exportVerticesData() {
		List<List<Float>> export = new ArrayList<List<Float>>();
		int length = voxels.size();
		for(int i=0; i < length; i++) {
			export.addAll(voxels.get(i).exportVerticesData());
		}
		return export;
	}

	@Override
	public final List<List<Integer>> exportTriangleData(int offset) {
		List<List<Integer>> export = new ArrayList<List<Integer>>();
		int length = voxels.size();
		for(int i=0; i < length; i++) {
			export.addAll(voxels.get(i).exportTriangleData(offset));
			offset++; //Update the offset!
		}
		return export;
	}

	@Override
	public final List<List<Float>> exportNormalData() {
		List<List<Float>> export = new ArrayList<List<Float>>();
		int length = voxels.size();
		for(int i=0; i < length; i++) {
			export.addAll(voxels.get(i).exportNormalData());
		}
		return export;
	}

	@Override
	public final List<Integer> exportColorData() {
		List<Integer> export = new ArrayList<Integer>();
		int length = voxels.size();
		for(int i=0; i < length; i++) {
			export.addAll(voxels.get(i).exportColorData());
		}
		return export;
	}

}
