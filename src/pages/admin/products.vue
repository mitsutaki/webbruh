
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useProductStore, type Product } from '@/stores/products';
import * as XLSX from 'xlsx';

const productStore = useProductStore();
const dialog = ref(false);
const dialogDelete = ref(false);
const search = ref('');
const valid = ref(false);

// Headers for v-data-table
const headers = [
  { title: 'Image', key: 'image', sortable: false },
  { title: 'Barcode', key: 'barcode' },
  { title: 'Name', key: 'name' },
  { title: 'Category', key: 'category' },
  { title: 'Price', key: 'price' },
  { title: 'Stock', key: 'stock' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const defaultItem: Product = {
  id: -1,
  name: '',
  price: 0,
  category: '',
  image: '',
  barcode: '',
  stock: 0,
};

const editedItem = ref<Product>({ ...defaultItem });
const editedIndex = ref(-1);

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Product' : 'Edit Product';
});

function editItem(item: Product) {
  editedIndex.value = productStore.products.indexOf(item);
  editedItem.value = { ...item };
  dialog.value = true;
}

function deleteItem(item: Product) {
  editedIndex.value = productStore.products.indexOf(item);
  editedItem.value = { ...item };
  dialogDelete.value = true;
}

function deleteItemConfirm() {
  productStore.deleteProduct(editedItem.value.id);
  closeDelete();
}

function close() {
  dialog.value = false;
  editedItem.value = { ...defaultItem };
  editedIndex.value = -1;
}

function closeDelete() {
  dialogDelete.value = false;
  editedItem.value = { ...defaultItem };
  editedIndex.value = -1;
}

function save() {
  if (editedIndex.value > -1) {
    productStore.updateProduct(editedItem.value);
  } else {
    // Need to cast to Omit<Product, 'id'> effectively or let the store handle it
    const { id, ...newProduct } = editedItem.value;
    productStore.addProduct(newProduct);
  }
  close();
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

// Image Upload Simulation
function onFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if(e.target?.result) {
                editedItem.value.image = e.target.result as string;
            }
        };
        reader.readAsDataURL(target.files[0]);
    }
}

// Export to Excel
function exportToExcel() {
    const data = productStore.products.map(p => ({
        ID: p.id,
        Name: p.name,
        Category: p.category,
        Price: p.price,
        Stock: p.stock,
        Barcode: p.barcode || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "products_export.xlsx");
}
</script>

<template>
  <div class="h-100 pa-4">
    <v-data-table
      :headers="headers"
      :items="productStore.products"
      :search="search"
      class="elevation-1 rounded-lg"
    >
      <template v-slot:top>
        <v-toolbar flat color="transparent" class="px-2">
          <v-toolbar-title class="font-weight-bold text-h5">Product Management</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            label="Search"
            single-line
            hide-details
            variant="outlined"
            style="max-width: 300px;"
            class="mr-2"
          ></v-text-field>

          <v-spacer></v-spacer>

          <v-btn
            color="success"
            prepend-icon="mdi-microsoft-excel"
            variant="tonal"
            class="mr-2"
            @click="exportToExcel"
          >
            Export
          </v-btn>

          <v-dialog v-model="dialog" max-width="600px">
            <template v-slot:activator="{ props }">
              <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" v-bind="props">
                New Product
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-form ref="form" v-model="valid">
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field 
                        v-model="editedItem.name" 
                        label="Product Name" 
                        variant="outlined"
                        :rules="[v => !!v || 'Name is required']"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field 
                        v-model="editedItem.category" 
                        label="Category" 
                        variant="outlined"
                        :rules="[v => !!v || 'Category is required']"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field 
                        v-model.number="editedItem.price" 
                        label="Price" 
                        prefix="Rp" 
                        type="number" 
                        variant="outlined"
                        :rules="[
                            v => !!v || 'Price is required',
                            v => v > 0 || 'Price must be greater than 0'
                        ]"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field 
                        v-model.number="editedItem.stock" 
                        label="Stock" 
                        type="number" 
                        variant="outlined"
                        :rules="[
                            v => v >= 0 || 'Stock cannot be negative',
                            v => Number.isInteger(Number(v)) || 'Stock must be an integer'
                        ]"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field 
                        v-model="editedItem.barcode" 
                        label="Barcode" 
                        prepend-inner-icon="mdi-barcode" 
                        variant="outlined"
                        :rules="[
                            v => !!v || 'Barcode is required',
                            v => {
                                // Check uniqueness (skip current item if editing)
                                const existing = productStore.findProductByBarcode(v);
                                return (!existing || existing.id === editedItem.id) || 'Barcode already exists';
                            }
                         ]"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                         <v-file-input
                            label="Product Image"
                            variant="outlined"
                            prepend-icon="mdi-camera"
                            accept="image/*"
                            @change="onFileChange"
                         ></v-file-input>
                         <v-img 
                            v-if="editedItem.image" 
                            :src="editedItem.image" 
                            height="100" 
                            class="mt-2 rounded-lg" 
                            cover
                         ></v-img>
                    </v-col>
                  </v-row>
                </v-container>
                </v-form>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="close">Cancel</v-btn>
                <v-btn color="blue-darken-1" variant="flat" @click="save" :disabled="!valid">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5 text-center py-4">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
                <v-btn color="error" variant="flat" @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      
      <template v-slot:item.image="{ item }">
        <v-avatar rounded="lg" size="48" class="my-1">
            <v-img :src="item.image" cover></v-img>
        </v-avatar>
      </template>

      <template v-slot:item.price="{ item }">
        {{ formatPrice(item.price) }}
      </template>

       <template v-slot:item.stock="{ item }">
        <v-chip
            :color="item.stock < 20 ? 'error' : 'success'"
            size="small"
            class="font-weight-bold"
        >
            {{ item.stock }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon size="small" class="me-2" @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon size="small" @click="deleteItem(item)" color="error">
          mdi-delete
        </v-icon>
      </template>
      <!-- <template v-slot:no-data>
        <v-btn color="primary" @click="initialize">Reset</v-btn>
      </template> -->
    </v-data-table>
  </div>
</template>
