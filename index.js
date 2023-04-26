import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
import {
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCFURNISHINGELEMENT,
  IFCDOOR,
  IFCWINDOW,
  IFCPLATE,
  IFCMEMBER
} from'web-ifc';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

// Create grid and axes
//viewer.grid.setGrid();
//viewer.axes.setAxes();

const scene = viewer.context.getScene();

loadIfc("./04.ifc");
let model;

async function loadIfc(url) {
    model = await viewer.IFC.loadIfcUrl(url);
    model.removeFromParent();
    await viewer.shadowDropper.renderShadow(model.modelID);
    viewer.context.renderer.postProduction.active = true;
    await setupAllCategories();
}

const categories = {
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCFURNISHINGELEMENT,
  IFCDOOR,
  IFCWINDOW,
  IFCPLATE,
  IFCMEMBER
}

function getName(category) {
  const names = Object.keys(categories);
  return names.find(name => categories[name] === category)
}
  async function getAll(category) {
    return viewer.IFC.loader.ifcManager.getAllItemsOfType(model.modelID, category);
}



const subsets = {};

async function setupAllCategories() {
  const allCategories = Object.values(categories);
  for(const category of allCategories){
    await setupCategory(category);
  }
}

async function setupCategory(category) {
  subsets[category] = await newSubsetOfType(category);
  setupCheckbox(category);
  }

function setupCheckbox(category) {
  const name = getName(category);
  const checkbox = document.getElementById(name);
  checkbox.addEventListener('change', () => {
    const subset = subsets[category];
    if(checkbox.checked) scene.add(subset);
    else subset.removeFromParent();
  })
}

async function newSubsetOfType(category){
  const ids = await getAll(category);
  return viewer.IFC.loader.ifcManager.createSubset({
    modelID: model.modelID,
    scene,
    ids,
    removePrevious: true,
    customID: category.toString()
  })
}