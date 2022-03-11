package voxelCode;

import java.util.*;

class cubeCmd extends advancedCmd {
	
	private Integer r,g,b;
	
	cubeCmd(float xStart, float yStart, float zStart, float xEnd, float yEnd, float zEnd, builder parentBuilder) {
		this(xStart, yStart, zStart, xEnd, yEnd, zEnd, 255.0f, 255.0f, 255.0f, parentBuilder);
	}
	
	cubeCmd(float xStart, float yStart, float zStart, float xEnd, float yEnd, float zEnd, float r, float g, float b, builder parentBuilder) {
		super(xStart, yStart, zStart, xEnd, yEnd, zEnd, parentBuilder);
		this.r = Math.round(r);
		this.g = Math.round(g);
		this.b = Math.round(b);
		
		genVoxels();
	}
	
	@Override
	protected void genVoxels() {
		voxels = new ArrayList<voxel>();
		
		float fstrt = xStart + yStart + zStart;
        float secnd = xEnd + yEnd + zEnd;
        float[] startPoint = new float[3];
        float[] endPoint = new float[3];
        if(fstrt <= secnd) {
        	startPoint[0] = xStart; startPoint[1] = yStart; startPoint[2] = zStart;
            endPoint[0] = xEnd; endPoint[1] = yEnd; endPoint[2] = zEnd;
        } else {
        	startPoint[0] = xEnd; startPoint[1] = yEnd; startPoint[2] = zEnd;
        	endPoint[0] = xStart; endPoint[1] = yStart; endPoint[2] = zStart;
        }
        
        float xDistance = endPoint[0] - startPoint[0];
        float yDistance = endPoint[1] - startPoint[1];
        float zDistance = endPoint[2] - startPoint[2];
        
        for (int z = 0; z <= Math.abs(zDistance); z++){
            for (int x = 0; x <= Math.abs(xDistance); x++) {
                for (int y = 0; y <= Math.abs(yDistance); y++) {
                    float xOffset = (xDistance < 0) ? -x : x;
                    float yOffset = (yDistance < 0) ? -y : y;
                    float zOffset = (zDistance < 0) ? -z : z;

                    voxels.add( new voxel(startPoint[0]+xOffset, startPoint[1]+yOffset, startPoint[2]+zOffset, r,g,b, this) );
                }
            }
        }
	}

}
