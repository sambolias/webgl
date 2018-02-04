/*  BasicWebGLApp.ts
 *  1/26/2018   
 *  Sam Erie
 *  serie@alaska.edu
 *  
 *  CS481
 *  Homework0 
 *  Most of this is from  class template
 *  Loaded texture onto triangle to learn typescript with webGL
 */

//Most of this is from  class template
//Loaded texture onto triangle to learn typescript with webGL
/// <reference path = "./Libs/lib.ts"/>
/// <reference path = "./Libs/Utils.ts"/>


class StaticVertexBufferObject {
    public buffer: WebGLBuffer | null = null;
    private gl: WebGLRenderingContext | null = null;
    private bufferLength: number = 0;
    private count: number = 0;
    constructor(gl: WebGLRenderingContext, private drawArraysMode: number, vertexData: Float32Array) {
        this.buffer = gl.createBuffer();
        if (!this.buffer)
            return;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
        this.bufferLength = vertexData.length * 4;
        this.count = vertexData.length / 4;
        this.gl = gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    Render(vertexLoc: number): void {
        if (!this.buffer || !this.gl || vertexLoc < 0)
            return;
        let gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(vertexLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexLoc);
        gl.drawArrays(this.drawArraysMode, 0, this.count);
        gl.disableVertexAttribArray(vertexLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}

class ShaderProgram {
    public program_: WebGLProgram | null = null;
    constructor(private gl: WebGLRenderingContext, public vertShaderSource: string, public fragShaderSource: string) {
        let vshader = this.createShader(gl.VERTEX_SHADER, vertShaderSource);
        let fshader = this.createShader(gl.FRAGMENT_SHADER, fragShaderSource);
        if (!vshader || !fshader)
            return;
        this.program_ = gl.createProgram();
        if (!this.program_)
            return;
        gl.attachShader(this.program_, vshader);
        gl.attachShader(this.program_, fshader);
        gl.linkProgram(this.program_);
        if (!gl.getProgramParameter(this.program_, gl.LINK_STATUS)) {
            console.error("Program Link Error")
            console.error(this.gl.getProgramInfoLog(this.program_));
            gl.deleteShader(vshader);
            gl.deleteShader(fshader);
            gl.deleteProgram(this.program_);
            this.program_ = null;
            return;
        }
    }

    Use(): void {
        if (!this.program_)
            return;
        this.gl.useProgram(this.program_);
    }

    GetVertexPosition(vertexName: string): number {
        return this.gl.getAttribLocation(this.program_, vertexName);
    }

    //my load texture function
    LoadTexture(image: HTMLImageElement): void
    {
        let tex = this.gl.createTexture();
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        this.Use();
        let loc = this.gl.getUniformLocation(this.program_, 'tex');
        if (loc != -1)
        {
            this.gl.uniform1i(loc, 0);
        }
        this.gl.useProgram(null);
    }

    private createShader(type: number, sourceCode: string): WebGLShader | null {
        let shader = this.gl.createShader(type);
        if (!shader)
            return null;
        this.gl.shaderSource(shader, sourceCode);
        this.gl.compileShader(shader);
        let status = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (!status) {
            if (type == this.gl.VERTEX_SHADER) console.error("Vertex shader compile error");
            if (type == this.gl.FRAGMENT_SHADER) console.error("Fragment shader compile error");
            console.error(this.gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
}

class BasicWebGLApp {
    private divElement_: HTMLDivElement | null = null;
    private canvasElement_: HTMLCanvasElement | null = null;
    private gl: WebGLRenderingContext | null = null;
  //  private vbo: StaticVertexBufferObject | null = null;
    private vbo: OBJ.IndexedGeometryMatrix | null = null;
    private program: ShaderProgram;
    private image: HTMLImageElement;   
    private enabledExtensions: string[] = [];
  //  private img: Util.ImageFileLoader;


    constructor(public width: number = 512, public height: number = 384) 
    {
        this.divElement_ = document.createElement("div");
        this.canvasElement_ = document.createElement("canvas");
        if (this.canvasElement_) {
            this.gl = this.canvasElement_.getContext("webgl");
            if (!this.gl) {
                this.gl = this.canvasElement_.getContext("experimental-webgl");
            }
            if (!this.gl) {
                this.canvasElement_ = null;
                this.divElement_.innerText = "WebGL not supported.";
            }
            else {
                this.divElement_.appendChild(this.canvasElement_);
                this.divElement_.align = "center";
            }
        }
        document.body.appendChild(this.divElement_);
        this.EnableExtensions([
            "OES_standard_derivatives",
            "WEBGL_depth_texture",
            "OES_texture_float",
            "OES_element_index_uint"
        ]);
 
    }

    EnableExtensions(names: string[]): boolean {
        if(!this.gl)
         return false;
        let supportedExtensions = this.gl.getSupportedExtensions();
        if (!supportedExtensions)
            return false;
        let allFound = true;
        for (var name of names) {
            let found = false;
            for (var ext of supportedExtensions) {
                if (name == ext) {
                    this.enabledExtensions.push(this.gl.getExtension(name));
                    console.log("Extension " + name + " enabled")
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.log("Extension " + name + " not enabled")
                allFound = false;
                break;
            }
        }
        return allFound;
    }

    run(): void {
        if (!this.gl) return;
        this.init(this.gl);
        this.mainloop(0);
    }

    mainloop(timestamp: number): void {
        let self = this;
        this.display(timestamp / 1000.0);
        window.requestAnimationFrame((t: number) => {
            self.mainloop(t);
        });
    }

    init(gl: WebGLRenderingContext): void {
        // this.vbo = new StaticVertexBufferObject(gl, gl.TRIANGLES, new Float32Array([
        //     -1, -1, 0, 1,
        //     1, -1, 0, 1,
        //     0, 1, 0, 1
        // ]));

        //load shaders then init shader resources
        let tmp = new Utils.ShaderLoader("vertex.vert", "fragment.frag", 
                (vert, frag) => {
                    this.program = new ShaderProgram(gl, vert, frag);
                    this.initResources();                   
                });
                    
    }

    initResources(): void {
        let tmp = new Utils.ImageFileLoader(".\\assets\\images\\8012-diffuse.jpg", 
                    () => { this.image = tmp.image; 
                            this.program.LoadTexture(this.image);
                        });
        let tmp2 = new Utils.TextFileLoader(".\\assets\\models\\teapot.obj", 
                    (data) => { 
                            if(this.gl)
                            {
                                this.vbo = OBJ.parseOBJ(data, this.gl.TRIANGLES);
                                this.vbo.Load(this.gl);
                            }
                        }); 
    }
   
    display(t: number): void {
        if (!this.gl || !this.canvasElement_) return;
        let gl = this.gl;
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0., 0., 0., 1.);
        gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, this.canvasElement_.width, this.canvasElement_.height);
        if (this.vbo && this.program) 
        {
            let mv =  Matrix4.makeIdentity();
            mv = mv.Translate(0.,0.,-4.);
            mv = mv.Rotate(t*100,0.,1.,0.);
            this.program.Use();
            let mloc = gl.getUniformLocation(this.program.program_, "MvMatrix");
            if(mloc && mloc >= 0)
                gl.uniformMatrix4fv(mloc, false, mv.asColMajorArray());
      //          else console.log("cant make mv");
            let ploc = gl.getUniformLocation(this.program.program_, "PMatrix");
            if(ploc && ploc >= 0)
                gl.uniformMatrix4fv(ploc, false, Matrix4.makePerspectiveX(45., 512./384., 0.1, 100.).asColMajorArray());
        //        else console.log("cant make p");
            this.vbo.Render(this.program);
          //  if(gl.getError() != null) console.log(gl.getError());
        }
        gl.useProgram(null);
    //    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}