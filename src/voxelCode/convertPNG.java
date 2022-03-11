package voxelCode;

import java.awt.Color;
import java.awt.image.*;
import java.io.*;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

import javax.imageio.ImageIO;

/*
 * Help:
 * 		1. https://stackoverflow.com/questions/6444869/how-do-i-read-pixels-from-a-png-file
 * 		2. https://docs.oracle.com/javase/7/docs/api/java/awt/image/BufferedImage.html#getRGB(int,%20int)
 * 		3. https://docs.oracle.com/javase/tutorial/2d/images/loadimage.html
 * 		4. https://docs.oracle.com/javase/7/docs/api/java/awt/image/Raster.html#getPixel%28int,%20int,%20double%5b%5d%29
 * 		5. https://stackoverflow.com/questions/2534116/how-to-convert-getrgbx-y-integer-pixel-to-colorr-g-b-a-in-java
 * 
 * I think JS can do the same thing if I first draw the image to a canvas and then read pixel data from there...
 */

public class convertPNG {
	
	private BufferedImage img;
	private String filename;
	
	convertPNG(String path) {
		
		if(path.indexOf(".png") == -1) {
			System.out.println("Invalid image file. Must be png file.");
			return;
		}
		
		try {
			//Maybe check out StringBuilder for replace: https://stackoverflow.com/questions/6952363/replace-a-character-at-a-specific-index-in-a-string
			Integer strIndex = path.lastIndexOf(".");
			char[] pathCharaArr = path.toCharArray();
			pathCharaArr[strIndex] = '|';
			path = String.valueOf(pathCharaArr); // "|" is not allowed in file names, so replace only the last period with it.
			
			String[] pathSplit = path.split("\\|"); //Split on "|"...
			filename = pathSplit[0];
			
			img = ImageIO.read(new File(filename + ".png"));
			convertToVoxels();
		} catch (IOException e) {
			System.out.println("Fail to read file.");
		}
	}
	
	public void convertToVoxels() {
		Integer width = img.getWidth();
		Integer height = img.getHeight();
		String data = "filename:" + filename + "\n";
		
		for(int y=0; y<height; y++) {
			for(int x=0; x<width; x++) {
				Color c = new Color(img.getRGB(x, y), true); //true for alpha.
				
				//If the pixel is not transparent...
				if(c.getAlpha() > 0) {
					data += "voxel[" + x + "," + (height-1 -y) + ", 0, " + c.getRed() + ", " + c.getGreen() + ", " + c.getBlue() + "]\n"; //"(height-1 -y)" to account for the PNG's flipped y-axis.
				}
			}
		}
		
		try {
			List<String> dataList = Arrays.asList(data);
	        Path outputFilePath = Paths.get(filename + ".vc");
	        Files.write(outputFilePath, dataList, Charset.forName("UTF-8"));
	        System.out.println("Conversion complete!");
		} catch (IOException e) {
			System.out.println("Fail to write output file.");
		}
		
	}
	
}
