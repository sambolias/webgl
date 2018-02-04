"use strict";
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
class StaticVertexBufferObject {
    constructor(gl, drawArraysMode, vertexData) {
        this.drawArraysMode = drawArraysMode;
        this.buffer = null;
        this.gl = null;
        this.bufferLength = 0;
        this.count = 0;
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
    Render(vertexLoc) {
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
    constructor(gl, vertShaderSource, fragShaderSource) {
        this.gl = gl;
        this.vertShaderSource = vertShaderSource;
        this.fragShaderSource = fragShaderSource;
        this.program_ = null;
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
            console.error("Program Link Error");
            console.error(this.gl.getProgramInfoLog(this.program_));
            gl.deleteShader(vshader);
            gl.deleteShader(fshader);
            gl.deleteProgram(this.program_);
            this.program_ = null;
            return;
        }
    }
    Use() {
        if (!this.program_)
            return;
        this.gl.useProgram(this.program_);
    }
    GetVertexPosition(vertexName) {
        return this.gl.getAttribLocation(this.program_, vertexName);
    }
    //my load texture function
    LoadTexture(image) {
        let tex = this.gl.createTexture();
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        this.Use();
        let loc = this.gl.getUniformLocation(this.program_, 'tex');
        if (loc != -1) {
            this.gl.uniform1i(loc, 0);
        }
        this.gl.useProgram(null);
    }
    createShader(type, sourceCode) {
        let shader = this.gl.createShader(type);
        if (!shader)
            return null;
        this.gl.shaderSource(shader, sourceCode);
        this.gl.compileShader(shader);
        let status = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (!status) {
            if (type == this.gl.VERTEX_SHADER)
                console.error("Vertex shader compile error");
            if (type == this.gl.FRAGMENT_SHADER)
                console.error("Fragment shader compile error");
            console.error(this.gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
}
class ShaderLoader {
    constructor(vertShaderUrl, fragShaderUrl, callbackfn) {
        this.vertShaderUrl = vertShaderUrl;
        this.fragShaderUrl = fragShaderUrl;
        this.callbackfn = callbackfn;
        this.vertLoaded = false;
        this.fragLoaded = false;
        this.vertFailed = false;
        this.fragFailed = false;
        this.vertShaderSource = "";
        this.fragShaderSource = "";
        let self = this;
        let vertXHR = new XMLHttpRequest();
        vertXHR.addEventListener("load", (e) => {
            self.vertShaderSource = vertXHR.responseText;
            self.vertLoaded = true;
            if (this.loaded) {
                self.callbackfn(self.vertShaderSource, self.fragShaderSource);
            }
        });
        vertXHR.addEventListener("abort", (e) => {
            self.vertFailed = true;
            console.error("unable to GET " + vertShaderUrl);
        });
        vertXHR.addEventListener("error", (e) => {
            self.vertFailed = true;
            console.error("unable to GET " + vertShaderUrl);
        });
        vertXHR.open("GET", vertShaderUrl);
        vertXHR.send();
        let fragXHR = new XMLHttpRequest();
        fragXHR.addEventListener("load", (e) => {
            self.fragShaderSource = fragXHR.responseText;
            self.fragLoaded = true;
            if (this.loaded) {
                self.callbackfn(self.vertShaderSource, self.fragShaderSource);
            }
        });
        fragXHR.addEventListener("abort", (e) => {
            self.fragFailed = true;
            console.error("unable to GET " + fragShaderUrl);
        });
        fragXHR.addEventListener("error", (e) => {
            self.vertFailed = true;
            console.error("unable to GET " + fragShaderUrl);
        });
        fragXHR.open("GET", fragShaderUrl);
        fragXHR.send();
    }
    get failed() { return this.vertFailed || this.fragFailed; }
    get loaded() { return this.vertLoaded && this.fragLoaded; }
}
class ImageFileLoader {
    constructor(url, callbackfn, parameter = 0) {
        this.callbackfn = callbackfn;
        this._loaded = false;
        this._failed = false;
        this.image = new Image();
        this.name = this.GetURLResource(url);
        let self = this;
        let ajax = new XMLHttpRequest();
        this.image.addEventListener("load", (e) => {
            callbackfn(self.image, this.name, parameter);
            self._loaded = true;
        });
        this.image.addEventListener("error", (e) => {
            self._failed = true;
            console.error("unable to GET " + url);
        });
        this.image.addEventListener("abort", (e) => {
            self._failed = true;
            console.error("unable to GET " + url);
        });
        this.image.src = url;
    }
    // return last part of the url name ignoring possible ending slash
    GetURLResource(url) {
        let parts = url.split('/');
        let lastSection = parts.pop() || parts.pop();
        if (lastSection) {
            return lastSection;
        }
        else {
            return "unknown";
        }
    }
    get loaded() { return this._loaded; }
    get failed() { return this._failed; }
}
//The rest is based on template from class
class BasicWebGLApp {
    constructor(width = 512, height = 384) {
        this.width = width;
        this.height = height;
        this.divElement_ = null;
        this.canvasElement_ = null;
        this.gl = null;
        this.vbo = null;
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
        //my contribution
        let tmp = new ImageFileLoader(".\\assets\\images\\8012-diffuse.jpg", () => {
            this.image = tmp.image;
            this.program.LoadTexture(this.image);
        });
        //     this.image = new Image();
        //    this.image.src = '.\\assets\\images\\8012-diffuse.jpg';
        //    this.image.onload = () => this.program.LoadTexture(this.image);
    }
    run() {
        if (!this.gl)
            return;
        this.init(this.gl);
        this.mainloop(0);
    }
    mainloop(timestamp) {
        let self = this;
        this.display(timestamp / 1000.0);
        window.requestAnimationFrame((t) => {
            self.mainloop(t);
        });
    }
    init(gl) {
        this.vbo = new StaticVertexBufferObject(gl, gl.TRIANGLES, new Float32Array([
            -1, -1, 0, 1,
            1, -1, 0, 1,
            0, 1, 0, 1
        ]));
        let v = "";
        let f = "";
        //and rewrote shaders - need to learn how to load externally
        let tmp = new ShaderLoader(".\\vertex.vert", ".\\fragment.frag", (vert, frag) => { v = vert; f = frag; });
        //this.program = new ShaderProgram(gl, tmp.vertShaderSource, tmp.fragShaderSource);});
        this.program = new ShaderProgram(gl, tmp.vertShaderSource, tmp.fragShaderSource);
        console.error(v);
        console.error(f);
        // this.program = new ShaderProgram(gl,
        //     "attribute vec4 position; varying vec2 tex_pos;"+
        //     "void main() { tex_pos = position.xy / position.w; gl_Position = position; }",
        //     "#ifdef GL_ES\nprecision mediump float;\n #endif\n" +
        //     "varying vec2 tex_pos; uniform sampler2D tex;"+
        //     "void main() { vec4 color = texture2D(tex, tex_pos); gl_FragColor = color; }");
    }
    //just changed clear color here - next assignment I will rewrite this stuff for myself
    //now that I understand it
    display(t) {
        if (!this.gl || !this.canvasElement_)
            return;
        let gl = this.gl;
        gl.clearColor(0., 0., 0., 1.);
        gl.clear(this.gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, this.canvasElement_.width, this.canvasElement_.height);
        if (this.vbo && this.program) {
            this.program.Use();
            this.vbo.Render(this.program.GetVertexPosition("position"));
        }
        gl.useProgram(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}
