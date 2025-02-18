class Cube {
  constructor() {
      this.type = 'cube';
      //this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      //this.size = 5.0;
      //this.segment = 5;
      this.matrix = new Matrix4();
      this.textureNum = -2;
  }

  render() {
    var rgba = this.color;

    //Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    //Pass point color to frag color
    gl.uniform4f(u_FragColor,rgba[0], rgba[1], rgba[2], rgba[3]);

    //Passing our transformation matrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //Front of cube
    drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

    // Top of cube
    drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0,0, 0,1, 1,1]);

    gl.uniform4f(u_FragColor, rgba[0]*.85, rgba[1]*.85, rgba[2]*.85, rgba[3]);

    // Right of cube
    drawTriangle3DUV([0,0,0,  0,1,1,  0,1,0], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([0,0,0,  0,0,1,  0,1,1], [0,0, 0,1, 1,1]);

    gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

    // Bottom of cube
    drawTriangle3DUV([0,0,0,  1,0,1,  0,0,1], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([0,0,0,  1,0,0,  1,0,1], [0,0, 0,1, 1,1]);

    gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

    // Left of cube
    drawTriangle3DUV([1,0,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([1,0,0,  1,0,1,  1,1,1], [0,0, 0,1, 1,1]);

    gl.uniform4f(u_FragColor, rgba[0]*.65, rgba[1]*.65, rgba[2]*.65, rgba[3]);

    // Back of cube
    drawTriangle3DUV([0,0,1,  1,1,1,  0,1,1], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([0,0,1,  1,0,1,  1,1,1], [0,0, 0,1, 1,1]);
}
  renderfast() {
      var rgba = this.color;

      // Check if it's the sky (textureNum = 0 for sky)
      if (this.textureNum === 0) {
          gl.uniform1i(u_whichTexture, 0); // Set textureNum to 0 for sky
      } else {
          gl.uniform1i(u_whichTexture, this.textureNum);
      }

      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      //Draw
      var allverts = [];
      var UVs = [];

      // Front of cube
      allverts = allverts.concat([0,0,0,  1,1,0,  1,0,0]); UVs = UVs.concat([0,0, 1,1, 1,0]);
      allverts = allverts.concat([0,0,0,  0,1,0,  1,1,0]); UVs = UVs.concat([0,0, 0,1, 1,1]);

      // Top of cube
      gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
      allverts = allverts.concat([0,1,0,  1,1,1,  1,1,0]); UVs = UVs.concat([0,0, 0,1, 1,1]);
      allverts = allverts.concat([0,1,0,  0,1,1,  1,1,1]); UVs = UVs.concat([0,0, 1,1, 1,0]);

      // Right of cube
      allverts = allverts.concat([1,0,0,  1,1,0,  1,1,1]); UVs = UVs.concat([0,0, 0,1, 1,1]);
      allverts = allverts.concat([1,0,0,  1,1,1,  1,0,1]); UVs = UVs.concat([0,0, 1,1, 1,0]);

      // Bottom of cube
      allverts = allverts.concat([0,0,0,  0,0,1,  1,0,1]); UVs = UVs.concat([0,0, 0,1, 1,1]);
      allverts = allverts.concat([0,0,0,  1,0,1,  1,0,0]); UVs = UVs.concat([0,0, 1,1, 1,0]);

      // Left of cube
      allverts = allverts.concat([0,0,0,  0,1,0,  0,1,1]); UVs = UVs.concat([0,0, 0,1, 1,1]);
      allverts = allverts.concat([0,0,0,  0,1,1,  0,0,1]); UVs = UVs.concat([0,0, 1,1, 1,0]);

      // Back of cube
      allverts = allverts.concat([0,0,1,  1,1,1,  1,0,1]); UVs = UVs.concat([0,0, 1,1, 1,0]);
      allverts = allverts.concat([0,0,1,  0,1,1,  1,1,1]); UVs = UVs.concat([0,0, 0,1, 1,1]);
      drawTriangle3DUV(allverts, UVs);
  }

  renderfaster(){
    var rgba = this.color;                                           
    
    // Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);
    // Pass the color of point to u_FragColor
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);  
    // Pass the matrix to u_ModelMatrix attribute 
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    drawTriangle3DUV(this.verts, this.uvVerts);
}
}
