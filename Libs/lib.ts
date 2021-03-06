// / <reference path = "../BasicWebGLApp.ts"/>
// / <reference path = "./Vector3.ts"/>

namespace OBJ
{
   class Parser
   {
       public lines: Array<string[]> = [];
       constructor(data: string)
       {
           let lines = data.split(/[\n\r]+/);
           for(let line of lines)
           {
               let rawTokens = line.split(/\s+/);
               let tokens: string[] = [];
               for(let t of rawTokens)
               {
                    if(t.length > 0)
                        if(t[0] == '#')
                            break;
                        else
                            tokens.push(t);
               }
               if(tokens.length > 0)
                this.lines.push(tokens);
           }
          
       }

       static ParseIdentifier(tokens: string[]): string 
       {
           if (tokens.length >= 2)
                return tokens[1].replace(/[ˆ\w]+/, "_"); 
                
            return "unknown";
        }
        
        static ParseVector(tokens: string[]): Vector3 
        { 
            let x: number = (tokens.length >= 2) ? parseFloat(tokens[1]) : 0.0;
            let y: number = (tokens.length >= 3) ? parseFloat(tokens[2]) : 0.0;
            let z: number = (tokens.length >= 4) ? parseFloat(tokens[3]) : 0.0; 
      
            return new Vector3(x, y, z); 
        } 
        static ParseFaceIndices(token: string): Array<number> 
        {
            let indices: Array<number> = [0, 0, 0];
            //splits around / or //
            let tokens = token.split(/[//]+/);
            
            //faces need to be subtracted because arrays are [0,..) and faces [1,..) 
            if (tokens.length >= 1) 
            {
                indices[0] = parseInt(tokens[0])-1;
            }  
            if (tokens.length == 2) 
            {
                indices[2] = parseInt(tokens[1])-1;
            } 
            else if (tokens.length == 3) 
            { 
                indices[1] = parseInt(tokens[1])-1; 
                indices[2] = parseInt(tokens[2])-1;
            }
            return indices;
        }
        static ParseFace(tokens: string[]): number[] 
        {
            let indices: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0]; 
            if (tokens.length < 4) 
                return indices; 
            let v1: Array<number> = this.ParseFaceIndices(tokens[1]); 
            let v2: Array<number> = this.ParseFaceIndices(tokens[2]);
            let v3: Array<number> = this.ParseFaceIndices(tokens[3]); 

            return [...v1, ...v2, ...v3]; 
        }
   }


   class Vertex { 
       constructor(public position: Vector3 = new Vector3(0., 0., 0.),
                   public normal: Vector3 = new Vector3(0., 0., 1.), 
                   public color: Vector3 = new Vector3(1., 1., 1.),
                   public texcoord: Vector3 = new Vector3(0., 0., 0.)) { }
        
        asFloat32Array(): Float32Array 
        { 
            return new Float32Array([this.position.x, this.position.y, this.position.z,
                 this.normal.x, this.normal.y, this.normal.z, 
                 this.texcoord.x, this.texcoord.y, this.texcoord.z,
                 this.color.x, this.color.y, this.color.z]); 
        } 
    }
    
    class Surface 
    { 
        public count: number = 0;
        constructor(readonly mode: number, readonly offset: number,
                    readonly mtllib: string, readonly mtl: string) { } 
        Add(): void { this.count++;  } 
    }

    export class IndexedGeometryMatrix
    {
        public vertices: Vertex[] = [];
        public indices: number[] = [];
        public surfaces: Surface[] = [];
        public failed: boolean = false;
        
        private vertbuffer: WebGLBuffer | null = null;
        private eltbuffer: WebGLBuffer | null = null;
        private gl: WebGLRenderingContext | null = null;
        public drawMode: number;
        private _mtllib: string;
        private _mtl: string;
        private _vertex: Vertex = new Vertex();

        Load(gl: WebGLRenderingContext) {
            //create buffer objects
            this.vertbuffer = gl.createBuffer();
            this.eltbuffer = gl.createBuffer();
            if (!this.vertbuffer || !this.eltbuffer)
                return;
            console.log("loading");
            console.log("verts: " + this.vertices.length);
            console.log("surfs :"+this.surfaces.length);
            console.log("inds: "+this.indices.length);

            //blunt way to transfer Vertex[] to Float32Array
            let vertexData: Float32Array;
            let v: number[] = [];
            for(let vert of this.vertices)
            {
                v.push(vert.position.x);
                v.push(vert.position.y);
                v.push(vert.position.z);
                v.push(vert.normal.x);
                v.push(vert.normal.y);
                v.push(vert.normal.z);
                v.push(vert.texcoord.x);
                v.push(vert.texcoord.y);
                v.push(vert.texcoord.z);
                v.push(vert.color.x);
                v.push(vert.color.y);
                v.push(vert.color.z);           
            }
            vertexData = new Float32Array(v);
            //other failed attempt
            //this.vertices.forEach((v, i, a)=>{ vertexData = new Float32Array([...vertexData,...v.asFloat32Array()])});

            //init vertex array buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

            //init index array buffer
            let elementData: Uint32Array = new Uint32Array(this.indices);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.eltbuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elementData, gl.STATIC_DRAW);
            this.gl = gl;

            //pop buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            console.log("buffers loaded");
            console.log("GL ERROR: "+gl.getError());
        }
    
        Render(shader: ShaderProgram): void {
            if (!this.vertbuffer || !this.eltbuffer || !this.gl || !shader.program_)
                return;
            let checkfail: boolean = this.failed;
            let failstring: string = "";

            let gl = this.gl;

            //bind buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.eltbuffer);

            //set up attributes
            let vloc = gl.getAttribLocation(shader.program_, "aPos" );
            if(vloc != -1)
            {
                gl.vertexAttribPointer(vloc, 3, gl.FLOAT, false, 48, 0);
                gl.enableVertexAttribArray(vloc);
            }
            else 
            {
                failstring = "cant make aPos" + gl.getError();
                this.failed = true;
            }
            let nloc = gl.getAttribLocation(shader.program_, "aNorm" );
            if(nloc != -1)
            {
                gl.vertexAttribPointer(nloc, 3, gl.FLOAT, false, 48, 12);
                gl.enableVertexAttribArray(nloc);
            }
 
            let tloc = gl.getAttribLocation(shader.program_, "aTexCoord" );
            if(tloc != -1)
            {
                gl.vertexAttribPointer(tloc, 3, gl.FLOAT, false, 48, 24);
                gl.enableVertexAttribArray(tloc);
            }

            let cloc = gl.getAttribLocation(shader.program_, "aColor" );
            if(cloc != -1)
            {
                gl.vertexAttribPointer(cloc, 3, gl.FLOAT, false, 48, 36);
                gl.enableVertexAttribArray(cloc);
            }
     

            //draw
            gl.drawElements(this.drawMode, this.indices.length, gl.UNSIGNED_INT, 0);

            //pop attribute/buffer stack
            if(vloc >= 0)
                gl.disableVertexAttribArray(vloc);
            if(nloc >= 0)
                gl.disableVertexAttribArray(nloc);
            if(tloc >= 0)
                gl.disableVertexAttribArray(tloc);
            if(cloc >= 0)
                gl.disableVertexAttribArray(cloc);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

            if(!checkfail && this.failed)
                console.log(failstring);
        }

        set mtllib(mtllib: string) {this._mtllib = mtllib;}
        set mtl(mtl: string) {this._mtl = mtl;}
        get currentIndexCount(): number
        {
            if(this.surfaces.length == 0)
                return 0;
            return this.surfaces[this.surfaces.length-1].count;
        }
        BeginSurface(mode: number)
        {
            if(this.surfaces.length == 0 || this.currentIndexCount != 0)   //begin new
                this.surfaces.push(new Surface(mode, this.indices.length, //or continue after
                                                this._mtllib, this._mtl));
        }
        AddIndex(index: number)
        {
            if(this.surfaces.length == 0) return;
            if(index < 0)
                this.indices.push(this.vertices.length-1);
            else 
                this.indices.push(index);
            this.surfaces[this.surfaces.length-1].Add();
        }
        SetNormal(normal: Vector3) { this._vertex.normal.copy(normal); }
        SetColor(color: Vector3) { this._vertex.color.copy(color); }
        SetTexCoord(tc: Vector3) { this._vertex.texcoord.copy(tc); }
        SetVertex(vertex: Vector3)
        {
            this._vertex.position.copy(vertex);
            this.vertices.push(this._vertex);
            this._vertex = new Vertex();
        }
    }

    export function parseOBJ(text: string, mode: number): IndexedGeometryMatrix
    {
        let vbo = new IndexedGeometryMatrix();
        vbo.drawMode = mode;
        let tp = new Parser(text);

        let vertices: Array<Vector3> = [];
        let normals: Array<Vector3> = [];
        let texcoords: Array<Vector3> = [];
        let colors: Array<Vector3> = [];
        let indices: Array<number> = [];
        //console.log(tp.lines.length);
        //console.log(tp.lines[1]);
        for(let tokens of tp.lines)
        {
            if(tokens.length <= 2)
            {
                if(tokens[0] == 'usemtl')
                    vbo.mtl = Parser.ParseIdentifier(tokens);
                else if(tokens[0] == 'mtllib')
                    vbo.mtllib = tokens[1];
                else if(tokens[0] == 'g')
                    vbo.BeginSurface(mode);
                else if(tokens[0] == 'o')
                    vbo.BeginSurface(mode);
                else if(tokens[0] == 's')
                    vbo.BeginSurface(mode);     
            }
            else if(tokens.length >= 4)
            {
                //begin surface if there is none? got no indices in bunny because it never has o g || s
                if(tokens[0] == 'v')
                    vertices.push(Parser.ParseVector(tokens));
                else if(tokens[0] == 'vn')
                    normals.push(Parser.ParseVector(tokens));
                else if(tokens[0] == 'vt')
                    texcoords.push(Parser.ParseVector(tokens));
                else if(tokens[0] == 'c')   //not sure what this would be
                    colors.push(Parser.ParseVector(tokens));
                else if(tokens[0] == 'f')
                {                
                    let faces = Parser.ParseFace(tokens);

                    for(let i = 0; i < 3; i++)
                    {
                        if(normals.length > faces[i*3+1])
                         vbo.SetNormal(normals[faces[i*3+1]]);
                        else vbo.SetNormal(new Vector3(0.,0.,1.));
                        if(texcoords.length > faces[i*3+2])
                         vbo.SetTexCoord(texcoords[faces[i*3+2]]);
                        else vbo.SetTexCoord(new Vector3(0.,0.,0.));
                        if(colors.length > faces[i*3+2])
                         vbo.SetColor(colors[faces[i*3+2]]);    //not allowed in faced either
                        else vbo.SetColor(new Vector3(1.,1.,1.));   //redundant from vertex ctor
                        if(vertices.length > faces[i*3+0])    
                         vbo.SetVertex(vertices[faces[i*3+0]]);
                        else
                        {
                            vbo.SetVertex(new Vector3(0.,0.,0.));
                            console.log("error missing vertex");
                            console.log(faces);
                            console.log(vertices.length);
                            console.log(normals.length);
                           
                        }
                        vbo.AddIndex(-1);
                    }                  
                    
                }
            }
        }
        console.log("vbo loaded from file");
        return vbo;
    }
}