# BlueLoop scene assets

The bundled assets support an illustrative Elmina reference environment. They do not depict a surveyed park or installed water infrastructure.

| Local files | Source | License and modifications |
| --- | --- | --- |
| `tree.glb` | [Poly Haven: Island Tree 01](https://polyhaven.com/a/island_tree_01) | CC0 1.0. Trunk and branches simplified; every leaf retained with six triangles; vertex attributes quantized; textures reduced to 1K. |
| `shrub.glb`, `shrub-alpha.png` | [Poly Haven: Shrub 01](https://polyhaven.com/a/shrub_01) | CC0 1.0. Geometry simplified and textures reduced to 1K. |
| `grass_ground-*.jpg` | [Poly Haven: Grass Ground](https://polyhaven.com/a/grass_ground) | CC0 1.0. 1K diffuse, OpenGL normal, and roughness maps; tinted in the renderer. |
| `concrete_floor_worn_001-*.jpg` | [Poly Haven: Concrete Floor Worn 001](https://polyhaven.com/a/concrete_floor_worn_001) | CC0 1.0. 1K diffuse, OpenGL normal, and roughness maps. |
| `daylight.hdr` | [Poly Haven: Kloofendal 48d Partly Cloudy Puresky](https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky) | CC0 1.0. 1K lighting environment. |
| `water-normal.jpg` | [Three.js example texture](https://github.com/mrdoob/three.js/blob/r170/examples/textures/waternormals.jpg) | MIT. Renamed, unmodified. Copyright notice below. |

Poly Haven publishes its assets under the [CC0 1.0 Universal dedication](https://creativecommons.org/publicdomain/zero/1.0/). See its [asset license](https://polyhaven.com/license). Source files were retrieved on 23 October 2026 through the Poly Haven API and are served locally at runtime.

The terrain, pond banks, paths, benches, lights, tanks, pump station, pipework, gate, and irrigation meshes are authored in `src/components/simulation/TownshipScene.tsx` for this prototype. The scene is compressed visually; engineering capacities come from the simulation, not mesh dimensions.

`previews/*.jpg` are screenshots generated from this Three.js environment and its locally bundled source assets.

## Three.js MIT notice

Copyright © 2010–2024 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
