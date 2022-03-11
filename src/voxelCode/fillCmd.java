package voxelCode;

import java.util.*;


class fillCmd extends advancedCmd {
	
	private List<List<Float>> fillElements;
	
	
	fillCmd(float xStart, float yStart, float zStart, float xEnd, float yEnd, float zEnd, List<List<Float>> fillElements, builder parentBuilder) {
		super(xStart, yStart, zStart, xEnd, yEnd, zEnd, parentBuilder);
		this.fillElements = fillElements;
		
		genVoxels();
		deleteLocalDuplicateVoxels(); //Only needed on the listCmd not needed on the cubeCmd... Might be needed in future commands...
	}
	
	@Override
	protected void genVoxels() {
		List<Float> elementsCenter = groupCenter(fillElements);
		List<List<Float>> fillLinePoints = calculate3DLine(xStart, yStart, zStart, xEnd, yEnd, zEnd);

        int fillLinePointsCount = fillLinePoints.size();
        for(int p=0; p<fillLinePointsCount; p++){
            float pTransform[] = {fillLinePoints.get(p).get(0) - elementsCenter.get(0), fillLinePoints.get(p).get(1) - elementsCenter.get(1), fillLinePoints.get(p).get(2) - elementsCenter.get(2)};

            int fillElementsCount = fillElements.size();
            for(int e=0; e<fillElementsCount; e++){
                float transformedPosition[] = {fillElements.get(e).get(0) + pTransform[0], fillElements.get(e).get(1) + pTransform[1], fillElements.get(e).get(2) + pTransform[2]};

                voxels.add( new voxel(transformedPosition[0], transformedPosition[1], transformedPosition[2], Math.round(fillElements.get(e).get(3)), Math.round(fillElements.get(e).get(4)), Math.round(fillElements.get(e).get(5)), this) );
            }
        }
	}
	
	private List<Float> groupCenter(List<List<Float>> voxelList){
		float x,y,z;
        float xMin = voxelList.get(0).get(0), yMin = voxelList.get(0).get(1), zMin = voxelList.get(0).get(2);
        float xMax = voxelList.get(0).get(0), yMax = voxelList.get(0).get(1), zMax = voxelList.get(0).get(2);
		
        int voxelListCount = voxelList.size();
        for(int i=0; i<voxelListCount; i++){

            xMin = (voxelList.get(i).get(0) < xMin) ? voxelList.get(i).get(0) : xMin;
            xMax = (voxelList.get(i).get(0) > xMax) ? voxelList.get(i).get(0) : xMax;

            yMin = (voxelList.get(i).get(1) < yMin) ? voxelList.get(i).get(1) : yMin;
            yMax = (voxelList.get(i).get(1) > yMax) ? voxelList.get(i).get(1) : yMax;

            zMin = (voxelList.get(i).get(2) < zMin) ? voxelList.get(i).get(2) : zMin;
            zMax = (voxelList.get(i).get(2) > zMax) ? voxelList.get(i).get(2) : zMax;
        }
        
        x = xMax + xMin;
        y = yMax + yMin;
        z = zMax + zMin;
        
		List<Float> centerPos =  new ArrayList<Float>();
		centerPos.addAll(Arrays.asList((float)Math.floor(x/2), (float)Math.floor(y/2), (float)Math.floor(z/2)));
		return centerPos;
	}
	
	private List<List<Float>> calculate3DLine(float x1, float y1, float z1, float x2, float y2, float z2){
		List<List<Float>> linePoints = new ArrayList<List<Float>>();
		float[] calcVector = new float[] {x2 - x1, y2 - y1, z2 - z1};
		
		if ( Math.abs(calcVector[0]) >= Math.abs(calcVector[1]) && Math.abs(calcVector[0]) >= Math.abs(calcVector[2]) ){
            if(x1 > x2){
                float xTemp = x1;
                float yTemp = y1;
                float zTemp = z1;

                x1 = x2;
                y1 = y2;
                z1 = z2;

                x2 = xTemp;
                y2 = yTemp;
                z2 = zTemp;
            }

            for (float x = x1; x < x2; x++) {
                float t = (x - x1)/calcVector[0];
                List<Float> point = new ArrayList<Float>();
                point.addAll(Arrays.asList(x, calcVector[1] * t + y1, calcVector[2] * t + z1));
                linePoints.add(point);
            }
        } else if ( Math.abs(calcVector[1]) >= Math.abs(calcVector[0]) && Math.abs(calcVector[1]) >= Math.abs(calcVector[2]) ){
            if(y1 > y2){
                float xTemp = x1;
                float yTemp = y1;
                float zTemp = z1;

                x1 = x2;
                y1 = y2;
                z1 = z2;

                x2 = xTemp;
                y2 = yTemp;
                z2 = zTemp;
            }

            for (float y = y1; y < y2; y++) {
                float t = (y - y1)/calcVector[1];
                List<Float> point = new ArrayList<Float>();
                point.addAll(Arrays.asList(calcVector[0] * t + x1, y, calcVector[2] * t + z1));
                linePoints.add(point);
            }
        } else if ( Math.abs(calcVector[2]) >= Math.abs(calcVector[0]) && Math.abs(calcVector[2]) >= Math.abs(calcVector[1]) ){
            if(z1 > z2){
                float xTemp = x1;
                float yTemp = y1;
                float zTemp = z1;

                x1 = x2;
                y1 = y2;
                z1 = z2;

                x2 = xTemp;
                y2 = yTemp;
                z2 = zTemp;
            }

            for (float z = z1; z < z2; z++) {
                float t = (z - z1)/calcVector[2];
                List<Float> point = new ArrayList<Float>();
                point.addAll(Arrays.asList(calcVector[0] * t + x1, calcVector[1] * t + y1, z));
                linePoints.add(point);
            }
        }
		
		// Insert the final end point.
		List<Float> point = new ArrayList<Float>();
        point.addAll(Arrays.asList(x2, y2, z2));
        linePoints.add(point);
		
		return linePoints;
	}	
}
