class Pyramid {
    constructor() {
        this.type = 'pyramid';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        gl.uniform4f(u_FragColor, rgba[0] * 0.95, rgba[1] * 0.95, rgba[2] * 0.95, rgba[3]);
        drawTriangle3D([-0.5, -0.5, 0.5,  0, 0.5, 0,  0.5, -0.5, 0.5]);
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        drawTriangle3D([0.5, -0.5, 0.5,   0, 0.5, 0,  0.5, -0.5, -0.5]);
        gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);
        drawTriangle3D([0.5, -0.5, -0.5,  0, 0.5, 0,  -0.5, -0.5, -0.5]);
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangle3D([-0.5, -0.5, -0.5,   0, 0.5, 0,  -0.5, -0.5, 0.5]);
        gl.uniform4f(u_FragColor, rgba[0] * 0.65, rgba[1] * 0.65, rgba[2] * 0.65, rgba[3]);
        drawTriangle3D([-0.5, -0.5, 0.5,   -0.5, -0.5, -0.5,  0.5, -0.5, 0.5]);
        gl.uniform4f(u_FragColor, rgba[0] * 0.65, rgba[1] * 0.65, rgba[2] * 0.65, rgba[3]);
        drawTriangle3D([0.5, -0.5, 0.5,   -0.5, -0.5, -0.5,  0.5, -0.5, -0.5]);
    }
}