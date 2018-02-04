// Fluxions WebGL Library
// Copyright (c) 2017 - 2018 Jonathan Metzgar
// All Rights Reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
/// <reference path="./Fluxions.ts"/>

class RenderConfig {
    private _isCompiled: boolean = false;
    private _isLinked: boolean = false;
    private _vertShader: WebGLShader | null = null;
    private _fragShader: WebGLShader | null = null;
    private _program: WebGLProgram | null = null;
    private _vertShaderInfoLog: string = "";
    private _fragShaderInfoLog: string = "";
    private _vertShaderCompileStatus: boolean = false;
    private _fragShaderCompileStatus: boolean = false;
    private _programInfoLog: string = "";
    private _programLinkStatus: boolean = false;
    public uniforms: Map<string, WebGLUniformLocation | null> = new Map<string, WebGLUniformLocation | null>();
    public uniformInfo: Map<string, WebGLActiveInfo | null> = new Map<string, WebGLActiveInfo | null>();

    constructor(private _context: Fluxions, private _vertShaderSource: string, private _fragShaderSource: string) {
        this.Reset(this._vertShaderSource, this._fragShaderSource);
    }

    IsCompiledAndLinked(): boolean {
        if (this._isCompiled && this._isLinked)
            return true;
        return false;
    }

    public Use() {
        this._context.gl.useProgram(this._program);
    }

    public Restore() {

    }

    public GetAttribLocation(name: string): number {
        let gl = this._context.gl;
        return gl.getAttribLocation(this._program, name);
    }

    public GetUniformLocation(name: string): number {
        let gl = this._context.gl;
        let uloc: any = gl.getUniformLocation(this._program, name);
        if (!uloc) return -1;
        return uloc;
    }

    public Reset(vertShaderSource: string, fragShaderSource: string): boolean {
        let gl = this._context.gl;

        let vertShader: WebGLShader | null = gl.createShader(gl.VERTEX_SHADER);
        if (vertShader) {
            gl.shaderSource(vertShader, vertShaderSource);
            gl.compileShader(vertShader);
            let status = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
            let infoLog: string | null = null;
            if (!status) {
                infoLog = gl.getShaderInfoLog(vertShader);
                let errorElement: HTMLElement | null = document.getElementById("errors");
                if (!errorElement && infoLog) {
                    let newDiv: HTMLDivElement = document.createElement("div");
                    newDiv.appendChild(document.createTextNode(infoLog));
                    document.body.appendChild(newDiv);
                }
            }
            if (status)
                this._vertShaderCompileStatus = true;
            if (infoLog)
                this._vertShaderInfoLog = infoLog;
            this._vertShader = vertShader;
        }
        else {
            return false;
        }

        let fragShader: WebGLShader | null = gl.createShader(gl.FRAGMENT_SHADER);
        if (fragShader) {
            gl.shaderSource(fragShader, fragShaderSource);
            gl.compileShader(fragShader);
            let status = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
            let infoLog: string | null = null;
            if (!status) {
                infoLog = gl.getShaderInfoLog(fragShader);
                let errorElement: HTMLElement | null = document.getElementById("errors");
                if (!errorElement && infoLog) {
                    let newDiv: HTMLDivElement = document.createElement("div");
                    newDiv.appendChild(document.createTextNode(infoLog));
                    document.body.appendChild(newDiv);
                }
            }
            if (status)
                this._fragShaderCompileStatus = true;
            if (infoLog)
                this._fragShaderInfoLog = infoLog;
            this._fragShader = fragShader;
        }
        else {
            return false;
        }

        if (this._vertShaderCompileStatus && this._fragShaderCompileStatus) {
            this._program = gl.createProgram();
            if (this._program) {
                gl.attachShader(this._program, this._vertShader);
                gl.attachShader(this._program, this._fragShader);
                gl.linkProgram(this._program);
                if (gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
                    this._programLinkStatus = true;
                }
                else {
                    this._programLinkStatus = false;
                    let infoLog = gl.getProgramInfoLog(this._program);
                    if (infoLog) {
                        this._programInfoLog = infoLog;
                        let errorElement: HTMLElement | null = document.getElementById("errors");
                        if (!errorElement && infoLog) {
                            let newDiv: HTMLDivElement = document.createElement("div");
                            newDiv.appendChild(document.createTextNode(infoLog));
                            document.body.appendChild(newDiv);
                        }
                    }
                }
            }
        } else {
            return false;
        }

        this.updateActiveUniforms();

        return true;
    }

    private updateActiveUniforms(): boolean {
        let gl = this._context.gl;
        let numUniforms = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
        this.uniforms.clear();
        this.uniformInfo.clear();
        for (let i = 0; i < numUniforms; i++) {
            let uniform: WebGLActiveInfo | null = gl.getActiveUniform(this._program, i);
            if (!uniform)
                continue;
            this.uniformInfo.set(uniform.name, uniform);
            this.uniforms.set(uniform.name, gl.getUniformLocation(this._program, uniform.name));
        }
        return true;
    }
}
