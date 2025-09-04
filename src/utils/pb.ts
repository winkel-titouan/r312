import PocketBase from 'pocketbase';
import type { TypedPocketBase } from "./pocketbase-types";


const pb = new PocketBase('https://jbassil-agence.pockethost.io/') as TypedPocketBase;
export default pb;