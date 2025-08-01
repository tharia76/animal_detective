#!/usr/bin/env python3
"""
Script to create silhouettes from animal images.
This script processes all PNG images in the still-animals directory and creates
black silhouettes by making all non-transparent pixels black while preserving the alpha channel.
"""

import os
import sys
from PIL import Image, ImageOps
import argparse

def create_silhouette(input_path, output_path):
    """
    Create a silhouette from an input image.
    
    Args:
        input_path (str): Path to the input image
        output_path (str): Path where the silhouette will be saved
    """
    try:
        # Open the image
        with Image.open(input_path) as img:
            # Convert to RGBA if not already
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Get the image data
            data = img.getdata()
            
            # Create new image data - make all non-transparent pixels black
            new_data = []
            for item in data:
                # If the pixel is not transparent (alpha > 0)
                if item[3] > 0:  # Alpha channel
                    # Make it black but keep the original alpha
                    new_data.append((0, 0, 0, item[3]))
                else:
                    # Keep transparent pixels transparent
                    new_data.append(item)
            
            # Create new image with the silhouette data
            silhouette = Image.new('RGBA', img.size)
            silhouette.putdata(new_data)
            
            # Save the silhouette
            silhouette.save(output_path, 'PNG')
            print(f"✓ Created silhouette: {os.path.basename(output_path)}")
            
    except Exception as e:
        print(f"✗ Error processing {input_path}: {str(e)}")

def process_animals_directory(input_dir, output_dir):
    """
    Process all PNG images in the input directory and create silhouettes.
    
    Args:
        input_dir (str): Directory containing the original animal images
        output_dir (str): Directory where silhouettes will be saved
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Get all PNG files from the input directory
    png_files = [f for f in os.listdir(input_dir) if f.lower().endswith('.png')]
    
    if not png_files:
        print(f"No PNG files found in {input_dir}")
        return
    
    print(f"Found {len(png_files)} PNG files to process...")
    print("-" * 50)
    
    # Process each PNG file
    for filename in sorted(png_files):
        input_path = os.path.join(input_dir, filename)
        
        # Create output filename (add _silhouette before the extension)
        name, ext = os.path.splitext(filename)
        output_filename = f"{name}_silhouette{ext}"
        output_path = os.path.join(output_dir, output_filename)
        
        create_silhouette(input_path, output_path)
    
    print("-" * 50)
    print(f"Finished processing {len(png_files)} images!")
    print(f"Silhouettes saved to: {output_dir}")

def main():
    """Main function to run the silhouette creation script."""
    parser = argparse.ArgumentParser(description='Create silhouettes from animal images')
    parser.add_argument('--input', '-i', 
                      default='src/assets/images/still-animals',
                      help='Input directory containing animal images (default: src/assets/images/still-animals)')
    parser.add_argument('--output', '-o', 
                      default='src/assets/images/silhouettes',
                      help='Output directory for silhouettes (default: src/assets/images/silhouettes)')
    parser.add_argument('--single', '-s',
                      help='Process a single image file instead of a directory')
    
    args = parser.parse_args()
    
    print("🦋 Animal Silhouette Creator 🦋")
    print("=" * 50)
    
    # Check if we're processing a single file
    if args.single:
        if not os.path.exists(args.single):
            print(f"Error: Input file {args.single} does not exist!")
            sys.exit(1)
        
        # Create output filename
        input_dir = os.path.dirname(args.single)
        filename = os.path.basename(args.single)
        name, ext = os.path.splitext(filename)
        output_filename = f"{name}_silhouette{ext}"
        output_path = os.path.join(args.output, output_filename)
        
        # Create output directory if needed
        os.makedirs(args.output, exist_ok=True)
        
        create_silhouette(args.single, output_path)
        print(f"Silhouette saved to: {output_path}")
    else:
        # Process entire directory
        if not os.path.exists(args.input):
            print(f"Error: Input directory {args.input} does not exist!")
            sys.exit(1)
        
        process_animals_directory(args.input, args.output)

if __name__ == "__main__":
    main() 