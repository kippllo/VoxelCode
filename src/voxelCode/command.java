package voxelCode;

import java.util.*;

//Package wide.
interface command {
	builder getBuilder();
	int getVoxelCount();
	float[][] getVoxelPosits();
	void removeLocalInsideTriangles();
	void removeGlobalInsideTriangles(float[][] voxPosits);
	void deleteDuplicateVoxels(float[][] voxPosits);
	List<List<Float>> exportVerticesData();
	List<List<Integer>> exportTriangleData(int offset);
	List<List<Float>> exportNormalData();
	List<Integer> exportColorData();
}
