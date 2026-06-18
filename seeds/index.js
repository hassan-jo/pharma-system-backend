require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Medicine = require('../models/Medicine');
const Employee = require('../models/Employee');
const Shipment = require('../models/Shipment');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pharma_db';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear
  await Promise.all([User, Category, Medicine, Employee, Shipment, Invoice, Notification].map(M => M.deleteMany({})));
  console.log('🗑️  Cleared old data');

  // Users
  const adminPass = await bcrypt.hash('admin123', 12);
  const empPass = await bcrypt.hash('emp123', 12);
  const [admin, emp1] = await User.insertMany([
    { name: 'Ahmed Hassan', email: 'admin@pharma.com', password: adminPass, role: 'admin' },
    { name: 'Sara Mohamed', email: 'employee@pharma.com', password: empPass, role: 'employee' },
    { name: 'Omar Khaled', email: 'omar@pharma.com', password: empPass, role: 'employee' },
  ]);

  // Categories
  const cats = await Category.insertMany([
    { name: 'Painkillers', description: 'Pain relief medications', color: '#ef4444', icon: 'pill' },
    { name: 'Antibiotics', description: 'Bacterial infection fighters', color: '#3b82f6', icon: 'shield' },
    { name: 'Vitamins', description: 'Nutritional supplements', color: '#f59e0b', icon: 'sun' },
    { name: 'Skin Care', description: 'Dermatology products', color: '#8b5cf6', icon: 'sparkles' },
    { name: 'Diabetes', description: 'Diabetes management', color: '#06b6d4', icon: 'activity' },
    { name: 'Heart Medicines', description: 'Cardiovascular drugs', color: '#f43f5e', icon: 'heart' },
    { name: 'Antacids', description: 'Stomach and digestive', color: '#10b981', icon: 'droplets' },
    { name: 'Antihistamines', description: 'Allergy medications', color: '#6366f1', icon: 'wind' },
  ]);

  const catMap = {};
  cats.forEach(c => { catMap[c.name] = c._id; });

  // Medicines
  const futureDate = (months) => { const d = new Date(); d.setMonth(d.getMonth() + months); return d; };
  const pastDate = (months) => { const d = new Date(); d.setMonth(d.getMonth() - months); return d; };

  const medicines = await Medicine.insertMany([
    { name: 'Paracetamol 500mg', scientificName: 'Acetaminophen', category: catMap['Painkillers'], barcode: '1000001', price: 5.50, purchasePrice: 3.00, quantity: 250, minStockLevel: 30, expiryDate: futureDate(18), supplier: 'PharmaCo', description: 'Common pain reliever and fever reducer' },
    { name: 'Ibuprofen 400mg', scientificName: 'Ibuprofen', category: catMap['Painkillers'], barcode: '1000002', price: 8.00, purchasePrice: 4.50, quantity: 7, minStockLevel: 20, expiryDate: futureDate(12), supplier: 'MedSupply', description: 'Anti-inflammatory pain reliever' },
    { name: 'Amoxicillin 500mg', scientificName: 'Amoxicillin Trihydrate', category: catMap['Antibiotics'], barcode: '1000003', price: 18.00, purchasePrice: 10.00, quantity: 120, minStockLevel: 25, expiryDate: futureDate(15), supplier: 'BioPharm', description: 'Broad-spectrum antibiotic' },
    { name: 'Azithromycin 250mg', scientificName: 'Azithromycin', category: catMap['Antibiotics'], barcode: '1000004', price: 35.00, purchasePrice: 20.00, quantity: 4, minStockLevel: 15, expiryDate: futureDate(8), supplier: 'BioPharm', description: 'Macrolide antibiotic' },
    { name: 'Vitamin C 1000mg', scientificName: 'Ascorbic Acid', category: catMap['Vitamins'], barcode: '1000005', price: 12.00, purchasePrice: 6.00, quantity: 300, minStockLevel: 50, expiryDate: futureDate(24), supplier: 'NutriLab', description: 'Immune system support' },
    { name: 'Vitamin D3 5000IU', scientificName: 'Cholecalciferol', category: catMap['Vitamins'], barcode: '1000006', price: 22.00, purchasePrice: 12.00, quantity: 5, minStockLevel: 20, expiryDate: futureDate(20), supplier: 'NutriLab', description: 'Bone health supplement' },
    { name: 'Metformin 850mg', scientificName: 'Metformin HCl', category: catMap['Diabetes'], barcode: '1000007', price: 15.00, purchasePrice: 8.00, quantity: 180, minStockLevel: 40, expiryDate: futureDate(16), supplier: 'DiabeCare', description: 'Type 2 diabetes management' },
    { name: 'Atorvastatin 20mg', scientificName: 'Atorvastatin Calcium', category: catMap['Heart Medicines'], barcode: '1000008', price: 28.00, purchasePrice: 15.00, quantity: 90, minStockLevel: 20, expiryDate: futureDate(14), supplier: 'CardioMed', description: 'Cholesterol lowering medication' },
    { name: 'Omeprazole 20mg', scientificName: 'Omeprazole', category: catMap['Antacids'], barcode: '1000009', price: 14.00, purchasePrice: 7.00, quantity: 0, minStockLevel: 25, expiryDate: futureDate(10), supplier: 'GastroSupply', description: 'Proton pump inhibitor' },
    { name: 'Cetirizine 10mg', scientificName: 'Cetirizine HCl', category: catMap['Antihistamines'], barcode: '1000010', price: 9.00, purchasePrice: 5.00, quantity: 160, minStockLevel: 30, expiryDate: futureDate(22), supplier: 'AllergyLab', description: 'Non-drowsy antihistamine' },
    { name: 'Hydrocortisone Cream', scientificName: 'Hydrocortisone', category: catMap['Skin Care'], barcode: '1000011', price: 20.00, purchasePrice: 11.00, quantity: 8, minStockLevel: 15, expiryDate: futureDate(18), supplier: 'DermaLab', description: 'Anti-itch cream' },
    { name: 'Insulin Glargine', scientificName: 'Insulin Glargine rDNA', category: catMap['Diabetes'], barcode: '1000012', price: 95.00, purchasePrice: 55.00, quantity: 45, minStockLevel: 10, expiryDate: futureDate(6), supplier: 'DiabeCare', description: 'Long-acting insulin analog' },
    { name: 'Amlodipine 5mg', scientificName: 'Amlodipine Besylate', category: catMap['Heart Medicines'], barcode: '1000013', price: 18.00, purchasePrice: 9.00, quantity: 200, minStockLevel: 30, expiryDate: futureDate(20), supplier: 'CardioMed', description: 'Calcium channel blocker' },
    { name: 'Ranitidine 150mg', scientificName: 'Ranitidine HCl', category: catMap['Antacids'], barcode: '1000014', price: 11.00, purchasePrice: 6.00, quantity: 3, minStockLevel: 20, expiryDate: futureDate(9), supplier: 'GastroSupply', description: 'H2 receptor antagonist' },
    { name: 'Multivitamin Complex', scientificName: 'Multi-Vitamin', category: catMap['Vitamins'], barcode: '1000015', price: 30.00, purchasePrice: 16.00, quantity: 110, minStockLevel: 25, expiryDate: futureDate(24), supplier: 'NutriLab', description: 'Complete daily vitamin formula' },
  ]);

  // Employees
  await Employee.insertMany([
    { name: 'Ahmed Hassan', email: 'admin@pharma.com', phone: '01001234567', age: 35, address: '15 Tahrir St, Cairo', position: 'Pharmacy Manager', salary: 8000, startDate: pastDate(24), shift: 'morning', workingHours: 8, status: 'active', userId: admin._id },
    { name: 'Sara Mohamed', email: 'employee@pharma.com', phone: '01112345678', age: 28, address: '22 Nasr City, Cairo', position: 'Pharmacist', salary: 5500, startDate: pastDate(18), shift: 'morning', workingHours: 8, status: 'active', userId: emp1._id },
    { name: 'Omar Khaled', email: 'omar@pharma.com', phone: '01223456789', age: 32, address: '8 Heliopolis, Cairo', position: 'Pharmacist', salary: 5500, startDate: pastDate(12), shift: 'evening', workingHours: 8, status: 'active' },
    { name: 'Nour Ahmed', email: 'nour@pharma.com', phone: '01334567890', age: 25, address: '3 Maadi, Cairo', position: 'Sales Assistant', salary: 3500, startDate: pastDate(6), shift: 'morning', workingHours: 8, status: 'active' },
    { name: 'Karim Ali', email: 'karim@pharma.com', phone: '01445678901', age: 30, address: '55 Dokki, Giza', position: 'Cashier', salary: 3000, startDate: pastDate(9), shift: 'evening', workingHours: 8, status: 'on_leave' },
  ]);

  // Shipments
  const future = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };
  const past = (days) => { const d = new Date(); d.setDate(d.getDate() - days); return d; };

  await Shipment.insertMany([
    {
      supplier: 'PharmaCo International', supplierContact: '+20-2-1234567',
      orderDate: past(10), expectedArrival: future(5), status: 'shipped',
      items: [{ medicineName: 'Paracetamol 500mg', quantity: 500, unitCost: 3.00, total: 1500 }, { medicineName: 'Ibuprofen 400mg', quantity: 200, unitCost: 4.50, total: 900 }],
      totalCost: 2400, paymentStatus: 'paid', notes: 'Express delivery'
    },
    {
      supplier: 'BioPharm Egypt', supplierContact: '+20-2-9876543',
      orderDate: past(3), expectedArrival: future(12), status: 'pending',
      items: [{ medicineName: 'Amoxicillin 500mg', quantity: 300, unitCost: 10.00, total: 3000 }, { medicineName: 'Azithromycin 250mg', quantity: 150, unitCost: 20.00, total: 3000 }],
      totalCost: 6000, paymentStatus: 'unpaid'
    },
    {
      supplier: 'NutriLab Supplements', supplierContact: '+20-2-5554321',
      orderDate: past(20), expectedArrival: past(5), actualArrival: past(4), status: 'delivered',
      items: [{ medicineName: 'Vitamin C 1000mg', quantity: 400, unitCost: 6.00, total: 2400 }, { medicineName: 'Multivitamin Complex', quantity: 200, unitCost: 16.00, total: 3200 }],
      totalCost: 5600, paymentStatus: 'paid'
    },
    {
      supplier: 'CardioMed Pharma', supplierContact: '+20-2-7778888',
      orderDate: past(5), expectedArrival: future(20), status: 'delayed',
      items: [{ medicineName: 'Atorvastatin 20mg', quantity: 250, unitCost: 15.00, total: 3750 }, { medicineName: 'Amlodipine 5mg', quantity: 300, unitCost: 9.00, total: 2700 }],
      totalCost: 6450, paymentStatus: 'partial', notes: 'Delayed due to customs clearance'
    },
  ]);

  // Invoices - generate last 3 months of history
  const generateInvoices = async () => {
    const medList = medicines.slice(0, 10);
    const users = [admin, emp1];
    const invoices = [];
    const methods = ['cash', 'card', 'insurance'];
    const customers = ['Walk-in Customer', 'Mohamed Ali', 'Fatma Ibrahim', 'Hassan Mahmoud', 'Aisha Omar', 'Youssef Nader'];

    for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
      const count = Math.floor(Math.random() * 8) + 2;
      for (let i = 0; i < count; i++) {
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const items = [];
        let subtotal = 0;
        for (let j = 0; j < itemCount; j++) {
          const med = medList[Math.floor(Math.random() * medList.length)];
          const qty = Math.floor(Math.random() * 3) + 1;
          const total = med.price * qty;
          subtotal += total;
          items.push({ medicine: med._id, medicineName: med.name, quantity: qty, unitPrice: med.price, total });
        }
        const discount = [0, 0, 0, 5, 10][Math.floor(Math.random() * 5)];
        const tax = 0;
        const discAmt = (subtotal * discount) / 100;
        const finalTotal = subtotal - discAmt;
        const date = new Date(); date.setDate(date.getDate() - daysAgo);
        date.setHours(Math.floor(Math.random() * 10) + 8, Math.floor(Math.random() * 60));
        invoices.push({
          invoiceNumber: `INV-${String(invoices.length + 1).padStart(6, '0')}`,
          customer: customers[Math.floor(Math.random() * customers.length)],
          items, subtotal, discount, tax,
          total: finalTotal,
          paymentMethod: methods[Math.floor(Math.random() * methods.length)],
          status: 'paid',
          createdBy: users[Math.floor(Math.random() * users.length)]._id,
          createdAt: date, updatedAt: date
        });
      }
    }
    await Invoice.insertMany(invoices);
    console.log(`✅ Created ${invoices.length} invoices`);
  };
  await generateInvoices();

  // Notifications
  await Notification.insertMany([
    { title: 'Low Stock Alert', message: 'Ibuprofen 400mg is running low (7 units remaining)', type: 'low_stock', severity: 'warning', targetRole: 'admin' },
    { title: 'Low Stock Alert', message: 'Azithromycin 250mg is critically low (4 units)', type: 'low_stock', severity: 'error', targetRole: 'admin' },
    { title: 'Expiry Warning', message: 'Insulin Glargine expires in less than 30 days', type: 'expiry', severity: 'warning', targetRole: 'admin' },
    { title: 'Shipment Update', message: 'Shipment from PharmaCo International is on the way', type: 'shipment', severity: 'info', targetRole: 'all' },
    { title: 'Shipment Delayed', message: 'CardioMed Pharma shipment has been delayed', type: 'shipment', severity: 'warning', targetRole: 'admin' },
    { title: 'Out of Stock', message: 'Omeprazole 20mg is now out of stock', type: 'low_stock', severity: 'error', targetRole: 'all' },
    { title: 'Monthly Report Ready', message: 'Last month analytics report is available', type: 'system', severity: 'info', targetRole: 'admin' },
  ]);

  console.log('🌱 Seed data inserted successfully!');
  console.log('👤 Admin: admin@pharma.com / admin123');
  console.log('👤 Employee: employee@pharma.com / emp123');
  await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });
