package voxelCode;

public class Driver {
	
	//Driver Code...
	public static void main(String[] args) {
		//Builder Code...
		builder b = new builder();

		//Check for no arguments passed...
	    if(args.length == 0){
	        b.printHelp(true, "Error in arguments!");
	        return;
	    }
	    
	    if(args[0].indexOf("?") != -1) {
	    	b.printHelp(false, "");
	        return;
	    }
	    
	    String filetype = "obj";
	    if(args.length >= 2 && args[1].indexOf("stl") != -1) {
	        filetype = args[1];
	    }
	    
	    //If the user wants to convert a png file...
	    if(args.length >= 2 && args[1].indexOf("convert") != -1) {
	    	new convertPNG(args[0]); //Just call the class constructor, it'll take care of the rest!
			return; //exit early. Make a better option handler later...
	    }
		
		b.compile(args[0], filetype);
		
	}
}
