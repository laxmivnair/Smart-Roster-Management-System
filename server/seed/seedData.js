require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');

// Import Models
const Pod = require('../models/Pod');
const Employee = require('../models/Employee');
const Brand = require('../models/Brand');
const BrandProcess = require('../models/BrandProcess');
const ResourceAllocation = require('../models/ResourceAllocation');
const LeaveSchedule = require('../models/LeaveSchedule');
const Roster = require('../models/Roster');

const seedDatabase = async (isAutoSeed = false) => {
  try {
    if (!isAutoSeed) {
      console.log('\n======================================================');
      console.log('   DATASTRAW SMART ROSTER - SEED DATA GENERATOR');
      console.log('======================================================\n');
    }

    console.log('[Seed] Purging existing database collections...');
    await Promise.all([
      Pod.deleteMany({}),
      Employee.deleteMany({}),
      Brand.deleteMany({}),
      BrandProcess.deleteMany({}),
      ResourceAllocation.deleteMany({}),
      LeaveSchedule.deleteMany({}),
      Roster.deleteMany({}),
    ]);
    console.log('[Seed] Clean purge complete.');

    // ------------------------------------------------------------------------
    // 1. Create Pods
    // ------------------------------------------------------------------------
    console.log('[Seed] Creating 3 Operational Pods...');
    const podsData = [
      { name: 'Pod Alpha - Apparel & Fashion', code: 'POD_ALPHA', description: 'Handles high-growth D2C apparel, footwear & lifestyle brands' },
      { name: 'Pod Beta - Beauty & Personal Care', code: 'POD_BETA', description: 'Handles organic cosmetics, wellness & skincare brands' },
      { name: 'Pod Gamma - Consumer Electronics & Tech', code: 'POD_GAMMA', description: 'Handles audio, smart accessories & hardware D2C brands' },
    ];
    const createdPods = await Pod.insertMany(podsData);
    const podAlpha = createdPods[0];
    const podBeta = createdPods[1];
    const podGamma = createdPods[2];

    // ------------------------------------------------------------------------
    // 2. Create 32 Employees
    // ------------------------------------------------------------------------
    console.log('[Seed] Creating 32 Employees across Pods...');
    const employeesData = [
      // --- POD ALPHA (11 Employees) ---
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@datastraw.io', podId: podAlpha._id, role: 'POD_LEAD', skills: ['CS', 'ACC', 'NDR', 'RETENTION'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Rahul Sharma', email: 'rahul.sharma@datastraw.io', podId: podAlpha._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'ACC', 'NDR'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Priya Patel', email: 'priya.patel@datastraw.io', podId: podAlpha._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'ACC'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Amit Verma', email: 'amit.verma@datastraw.io', podId: podAlpha._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'NDR'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Neha Gupta', email: 'neha.gupta@datastraw.io', podId: podAlpha._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Rohan Mehta', email: 'rohan.mehta@datastraw.io', podId: podAlpha._id, role: 'SENIOR_ASSOCIATE', skills: ['CS', 'ACC'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Sneha Rao', email: 'sneha.rao@datastraw.io', podId: podAlpha._id, role: 'OPERATIONS_ASSOCIATE', skills: ['ACC', 'RETENTION'], defaultWeeklyOffDays: ['Monday'] },
      { name: 'Kunal Shah', email: 'kunal.shah@datastraw.io', podId: podAlpha._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'NDR'], defaultWeeklyOffDays: ['Wednesday'] },
      { name: 'Pooja Nair', email: 'pooja.nair@datastraw.io', podId: podAlpha._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'ACC'], defaultWeeklyOffDays: ['Tuesday'] },
      { name: 'Deepak Joshi', email: 'deepak.joshi@datastraw.io', podId: podAlpha._id, role: 'OPERATIONS_ASSOCIATE', skills: ['NDR', 'RETENTION'], defaultWeeklyOffDays: ['Thursday'] },
      { name: 'Meera Iyer', email: 'meera.iyer@datastraw.io', podId: podAlpha._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'RETENTION'], defaultWeeklyOffDays: ['Friday'] },

      // --- POD BETA (11 Employees) ---
      { name: 'Vikram Malhotra', email: 'vikram.malhotra@datastraw.io', podId: podBeta._id, role: 'POD_LEAD', skills: ['CS', 'ACC', 'NDR', 'RETENTION'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Rajesh Khanna', email: 'rajesh.khanna@datastraw.io', podId: podBeta._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'ACC', 'NDR'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Sunita Das', email: 'sunita.das@datastraw.io', podId: podBeta._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'NDR'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Karan Singhal', email: 'karan.singhal@datastraw.io', podId: podBeta._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'RETENTION'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Divya Menon', email: 'divya.menon@datastraw.io', podId: podBeta._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Arjun Nair', email: 'arjun.nair@datastraw.io', podId: podBeta._id, role: 'SENIOR_ASSOCIATE', skills: ['CS', 'ACC', 'NDR'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Ritu Sen', email: 'ritu.sen@datastraw.io', podId: podBeta._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'ACC'], defaultWeeklyOffDays: ['Monday'] },
      { name: 'Varun Kapoor', email: 'varun.kapoor@datastraw.io', podId: podBeta._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'NDR'], defaultWeeklyOffDays: ['Tuesday'] },
      { name: 'Bhavna Jain', email: 'bhavna.jain@datastraw.io', podId: podBeta._id, role: 'OPERATIONS_ASSOCIATE', skills: ['ACC', 'RETENTION'], defaultWeeklyOffDays: ['Wednesday'] },
      { name: 'Sanjay Pillai', email: 'sanjay.pillai@datastraw.io', podId: podBeta._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'ACC'], defaultWeeklyOffDays: ['Thursday'] },
      { name: 'Tanvi Saxena', email: 'tanvi.saxena@datastraw.io', podId: podBeta._id, role: 'OPERATIONS_ASSOCIATE', skills: ['NDR', 'RETENTION'], defaultWeeklyOffDays: ['Friday'] },

      // --- POD GAMMA (10 Employees) ---
      { name: 'Ananya Roy', email: 'ananya.roy@datastraw.io', podId: podGamma._id, role: 'POD_LEAD', skills: ['CS', 'ACC', 'NDR', 'RETENTION'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Karthik Raman', email: 'karthik.raman@datastraw.io', podId: podGamma._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'ACC', 'NDR'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Swati Deshmukh', email: 'swati.deshmukh@datastraw.io', podId: podGamma._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'NDR'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Alok Mishra', email: 'alok.mishra@datastraw.io', podId: podGamma._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'ACC'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Shalini Hegde', email: 'shalini.hegde@datastraw.io', podId: podGamma._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Nikhil Joshi', email: 'nikhil.joshi@datastraw.io', podId: podGamma._id, role: 'SENIOR_ASSOCIATE', skills: ['CS', 'ACC'], defaultWeeklyOffDays: ['Sunday'] },
      { name: 'Aditi Bansal', email: 'aditi.bansal@datastraw.io', podId: podGamma._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'RETENTION'], defaultWeeklyOffDays: ['Monday'] },
      { name: 'Gaurav Taneja', email: 'gaurav.taneja@datastraw.io', podId: podGamma._id, role: 'OPERATIONS_ASSOCIATE', skills: ['NDR', 'ACC'], defaultWeeklyOffDays: ['Tuesday'] },
      { name: 'Kavita Kulkarni', email: 'kavita.kulkarni@datastraw.io', podId: podGamma._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'NDR'], defaultWeeklyOffDays: ['Wednesday'] },
      { name: 'Manish Pandey', email: 'manish.pandey@datastraw.io', podId: podGamma._id, role: 'OPERATIONS_ASSOCIATE', skills: ['CS', 'ACC', 'RETENTION'], defaultWeeklyOffDays: ['Thursday'] },
    ];

    const createdEmployees = await Employee.insertMany(employeesData);
    const empMap = {};
    createdEmployees.forEach((emp) => {
      empMap[emp.name] = emp;
    });

    // Update Pod Leads
    await Pod.findByIdAndUpdate(podAlpha._id, { leadId: empMap['Sarah Jenkins']._id });
    await Pod.findByIdAndUpdate(podBeta._id, { leadId: empMap['Vikram Malhotra']._id });
    await Pod.findByIdAndUpdate(podGamma._id, { leadId: empMap['Ananya Roy']._id });
    console.log('[Seed] Pod leads updated successfully.');

    // ------------------------------------------------------------------------
    // 3. Create 15 Brands (80% Single-Resource = 12, 20% Multi-Resource = 3)
    // ------------------------------------------------------------------------
    console.log('[Seed] Creating 15 Brands (12 Single-Resource, 3 Multi-Resource)...');
    const brandsData = [
      // Pod Alpha Single-Resource (4 brands)
      { name: 'SilkKnit Apparels', code: 'SILKKNIT', podId: podAlpha._id, tier: 'SINGLE_RESOURCE', description: 'Sustainable knitwear D2C' },
      { name: 'UrbanVibe Footwear', code: 'URBANVIBE', podId: podAlpha._id, tier: 'SINGLE_RESOURCE', description: 'Sneakers and streetwear' },
      { name: 'DenimCraft Studio', code: 'DENIMCRAFT', podId: podAlpha._id, tier: 'SINGLE_RESOURCE', description: 'Bespoke denim' },
      { name: 'AuraScents Fashion', code: 'AURASCENTS', podId: podAlpha._id, tier: 'SINGLE_RESOURCE', description: 'Luxury fragrances & styling' },

      // Pod Beta Single-Resource (4 brands)
      { name: 'GlowSkin Organics', code: 'GLOWSKIN', podId: podBeta._id, tier: 'SINGLE_RESOURCE', description: 'Ayurvedic & organic skincare' },
      { name: 'PureHerbal Wellness', code: 'PUREHERBAL', podId: podBeta._id, tier: 'SINGLE_RESOURCE', description: 'Herbal hair & personal care' },
      { name: 'DermaCare Clinic D2C', code: 'DERMACARE', podId: podBeta._id, tier: 'SINGLE_RESOURCE', description: 'Clinical active skincare' },
      { name: 'VelvetGlow Cosmetics', code: 'VELVETGLOW', podId: podBeta._id, tier: 'SINGLE_RESOURCE', description: 'Clean color cosmetics' },

      // Pod Gamma Single-Resource (4 brands)
      { name: 'PulseAudio Devices', code: 'PULSEAUDIO', podId: podGamma._id, tier: 'SINGLE_RESOURCE', description: 'TWS and smart audio gear' },
      { name: 'ZapGadgets Accessories', code: 'ZAPGADGETS', podId: podGamma._id, tier: 'SINGLE_RESOURCE', description: 'GaN chargers & power accessories' },
      { name: 'NomadTech Hardware', code: 'NOMADTECH', podId: podGamma._id, tier: 'SINGLE_RESOURCE', description: 'Travel electronics & peripherals' },
      { name: 'VoltPower Mobility', code: 'VOLTPOWER', podId: podGamma._id, tier: 'SINGLE_RESOURCE', description: 'EV charging accessories' },

      // Multi-Resource Brands (3 brands)
      { name: 'NovaFit Activewear', code: 'NOVAFIT', podId: podAlpha._id, tier: 'MULTI_RESOURCE', description: 'High-volume gymwear brand (3 staff)' },
      { name: 'LuxeLiving D2C', code: 'LUXELIVING', podId: podBeta._id, tier: 'MULTI_RESOURCE', description: 'Premium beauty & lifestyle (2 staff)' },
      { name: 'TechNova Smart Home', code: 'TECHNOVA', podId: podGamma._id, tier: 'MULTI_RESOURCE', description: 'Smart IoT home appliances (3 staff)' },
    ];

    const createdBrands = await Brand.insertMany(brandsData);
    const brandMap = {};
    createdBrands.forEach((b) => {
      brandMap[b.code] = b;
    });

    // ------------------------------------------------------------------------
    // 4. Create Brand Processes & Operating Rules
    // ------------------------------------------------------------------------
    console.log('[Seed] Configuring Brand Processes and Operating Calendars...');
    const processesData = [
      // 1. SilkKnit (Dedicated: Rahul Sharma) - 365 days
      { brandId: brandMap['SILKKNIT']._id, processType: 'CS', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },
      { brandId: brandMap['SILKKNIT']._id, processType: 'ACC', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },
      { brandId: brandMap['SILKKNIT']._id, processType: 'NDR', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },

      // 2. UrbanVibe (Dedicated: Priya Patel) - Mon-Sat
      { brandId: brandMap['URBANVIBE']._id, processType: 'CS', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minDailyStaffing: 1 },
      { brandId: brandMap['URBANVIBE']._id, processType: 'ACC', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minDailyStaffing: 1 },

      // 3. DenimCraft (Dedicated: Amit Verma) - Everyday except holidays
      { brandId: brandMap['DENIMCRAFT']._id, processType: 'CS', operatingCalendar: 'EXCEPT_HOLIDAYS', minDailyStaffing: 1 },
      { brandId: brandMap['DENIMCRAFT']._id, processType: 'NDR', operatingCalendar: 'EXCEPT_HOLIDAYS', minDailyStaffing: 1 },

      // 4. AuraScents (Dedicated: Neha Gupta) - 365 days
      { brandId: brandMap['AURASCENTS']._id, processType: 'CS', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },

      // 5. GlowSkin (Dedicated: Rajesh Khanna) - 365 days
      { brandId: brandMap['GLOWSKIN']._id, processType: 'CS', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },
      { brandId: brandMap['GLOWSKIN']._id, processType: 'ACC', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },
      { brandId: brandMap['GLOWSKIN']._id, processType: 'NDR', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },

      // 6. PureHerbal (Dedicated: Sunita Das) - Mon-Sat
      { brandId: brandMap['PUREHERBAL']._id, processType: 'CS', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minDailyStaffing: 1 },
      { brandId: brandMap['PUREHERBAL']._id, processType: 'NDR', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minDailyStaffing: 1 },

      // 7. DermaCare (Dedicated: Karan Singhal) - Everyday except holidays
      { brandId: brandMap['DERMACARE']._id, processType: 'CS', operatingCalendar: 'EXCEPT_HOLIDAYS', minDailyStaffing: 1 },
      { brandId: brandMap['DERMACARE']._id, processType: 'RETENTION', operatingCalendar: 'EXCEPT_HOLIDAYS', minDailyStaffing: 1 },

      // 8. VelvetGlow (Dedicated: Divya Menon) - 365 days
      { brandId: brandMap['VELVETGLOW']._id, processType: 'CS', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },

      // 9. PulseAudio (Dedicated: Karthik Raman) - 365 days
      { brandId: brandMap['PULSEAUDIO']._id, processType: 'CS', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },
      { brandId: brandMap['PULSEAUDIO']._id, processType: 'ACC', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },
      { brandId: brandMap['PULSEAUDIO']._id, processType: 'NDR', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },

      // 10. ZapGadgets (Dedicated: Swati Deshmukh) - Mon-Sat
      { brandId: brandMap['ZAPGADGETS']._id, processType: 'CS', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minDailyStaffing: 1 },
      { brandId: brandMap['ZAPGADGETS']._id, processType: 'NDR', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minDailyStaffing: 1 },

      // 11. NomadTech (Dedicated: Alok Mishra) - Everyday except holidays
      { brandId: brandMap['NOMADTECH']._id, processType: 'CS', operatingCalendar: 'EXCEPT_HOLIDAYS', minDailyStaffing: 1 },
      { brandId: brandMap['NOMADTECH']._id, processType: 'ACC', operatingCalendar: 'EXCEPT_HOLIDAYS', minDailyStaffing: 1 },

      // 12. VoltPower (Dedicated: Shalini Hegde) - 365 days
      { brandId: brandMap['VOLTPOWER']._id, processType: 'CS', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },

      // 13. NovaFit (Multi: Rohan Mehta on CS, Sneha Rao on ACC, Kunal Shah on Shared CS+NDR)
      { brandId: brandMap['NOVAFIT']._id, processType: 'CS', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },
      { brandId: brandMap['NOVAFIT']._id, processType: 'ACC', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minDailyStaffing: 1 },
      { brandId: brandMap['NOVAFIT']._id, processType: 'NDR', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 1 },

      // 14. LuxeLiving (Multi: Arjun Nair & Ritu Sen shared CS)
      { brandId: brandMap['LUXELIVING']._id, processType: 'CS', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 2 },

      // 15. TechNova (Multi: Nikhil Joshi & Aditi Bansal shared CS; Gaurav Taneja on NDR)
      { brandId: brandMap['TECHNOVA']._id, processType: 'CS', operatingCalendar: 'EVERYDAY_365', minDailyStaffing: 2 },
      { brandId: brandMap['TECHNOVA']._id, processType: 'NDR', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minDailyStaffing: 1 },
    ];

    const createdProcesses = await BrandProcess.insertMany(processesData);
    const procMap = {};
    createdProcesses.forEach((p) => {
      procMap[`${p.brandId.toString()}_${p.processType}`] = p;
    });

    // ------------------------------------------------------------------------
    // 5. Create Resource Allocations (Primary & Backup)
    // ------------------------------------------------------------------------
    console.log('[Seed] Assigning Employees to Brands and Processes...');
    const allocs = [];

    const addAlloc = (empName, brandCode, procType, roleType = 'PRIMARY') => {
      const brand = brandMap[brandCode];
      const proc = procMap[`${brand._id.toString()}_${procType}`];
      const emp = empMap[empName];
      if (!proc) {
        throw new Error(`Process not found for brand: ${brandCode}, type: ${procType}`);
      }
      allocs.push({
        employeeId: emp._id,
        brandId: brand._id,
        processId: proc._id,
        roleType,
      });
    };

    // Single-Resource Dedicated Allocations (12 brands)
    addAlloc('Rahul Sharma', 'SILKKNIT', 'CS');
    addAlloc('Rahul Sharma', 'SILKKNIT', 'ACC');
    addAlloc('Rahul Sharma', 'SILKKNIT', 'NDR');

    addAlloc('Priya Patel', 'URBANVIBE', 'CS');
    addAlloc('Priya Patel', 'URBANVIBE', 'ACC');

    addAlloc('Amit Verma', 'DENIMCRAFT', 'CS');
    addAlloc('Amit Verma', 'DENIMCRAFT', 'NDR');

    addAlloc('Neha Gupta', 'AURASCENTS', 'CS');

    addAlloc('Rajesh Khanna', 'GLOWSKIN', 'CS');
    addAlloc('Rajesh Khanna', 'GLOWSKIN', 'ACC');
    addAlloc('Rajesh Khanna', 'GLOWSKIN', 'NDR');

    addAlloc('Sunita Das', 'PUREHERBAL', 'CS');
    addAlloc('Sunita Das', 'PUREHERBAL', 'NDR');

    addAlloc('Karan Singhal', 'DERMACARE', 'CS');
    addAlloc('Karan Singhal', 'DERMACARE', 'RETENTION');

    addAlloc('Divya Menon', 'VELVETGLOW', 'CS');

    addAlloc('Karthik Raman', 'PULSEAUDIO', 'CS');
    addAlloc('Karthik Raman', 'PULSEAUDIO', 'ACC');
    addAlloc('Karthik Raman', 'PULSEAUDIO', 'NDR');

    addAlloc('Swati Deshmukh', 'ZAPGADGETS', 'CS');
    addAlloc('Swati Deshmukh', 'ZAPGADGETS', 'NDR');

    addAlloc('Alok Mishra', 'NOMADTECH', 'CS');
    addAlloc('Alok Mishra', 'NOMADTECH', 'ACC');

    addAlloc('Shalini Hegde', 'VOLTPOWER', 'CS');

    // Multi-Resource Allocations (3 brands)
    addAlloc('Rohan Mehta', 'NOVAFIT', 'CS', 'PRIMARY');
    addAlloc('Sneha Rao', 'NOVAFIT', 'ACC', 'PRIMARY');
    addAlloc('Kunal Shah', 'NOVAFIT', 'NDR', 'PRIMARY');
    addAlloc('Kunal Shah', 'NOVAFIT', 'CS', 'BACKUP');

    addAlloc('Arjun Nair', 'LUXELIVING', 'CS', 'PRIMARY');
    addAlloc('Ritu Sen', 'LUXELIVING', 'CS', 'PRIMARY');

    addAlloc('Nikhil Joshi', 'TECHNOVA', 'CS', 'PRIMARY');
    addAlloc('Aditi Bansal', 'TECHNOVA', 'CS', 'PRIMARY');
    addAlloc('Gaurav Taneja', 'TECHNOVA', 'NDR', 'PRIMARY');

    // Pod Peer Backups
    addAlloc('Pooja Nair', 'SILKKNIT', 'CS', 'BACKUP');
    addAlloc('Varun Kapoor', 'GLOWSKIN', 'CS', 'BACKUP');
    addAlloc('Kavita Kulkarni', 'PULSEAUDIO', 'CS', 'BACKUP');

    await ResourceAllocation.insertMany(allocs);
    console.log(`[Seed] Created ${allocs.length} resource allocations.`);

    // ------------------------------------------------------------------------
    // 6. Pre-configured Planned Leaves
    // ------------------------------------------------------------------------
    console.log('[Seed] Seeding planned leaves for November 2026...');
    const leavesData = [
      {
        employeeId: empMap['Rahul Sharma']._id,
        date: '2026-11-12',
        type: 'PLANNED_LEAVE',
        reason: 'Family wedding (3 days)',
      },
      {
        employeeId: empMap['Rahul Sharma']._id,
        date: '2026-11-13',
        type: 'PLANNED_LEAVE',
        reason: 'Family wedding (3 days)',
      },
      {
        employeeId: empMap['Rahul Sharma']._id,
        date: '2026-11-14',
        type: 'PLANNED_LEAVE',
        reason: 'Family wedding (3 days)',
      },
      {
        employeeId: empMap['Arjun Nair']._id,
        date: '2026-11-18',
        type: 'PLANNED_LEAVE',
        reason: 'Personal medical checkup',
      },
    ];
    await LeaveSchedule.insertMany(leavesData);

    if (!isAutoSeed) {
      console.log('\n======================================================');
      console.log('   SEED COMPLETE - VERIFICATION STATS');
      console.log('======================================================');
      console.log(`✓ Total Pods:                ${createdPods.length} (Alpha, Beta, Gamma)`);
      console.log(`✓ Pod Leads Assigned:        3 (Sarah Jenkins, Vikram Malhotra, Ananya Roy)`);
      console.log(`✓ Total Employees:           ${createdEmployees.length} (Requirement >= 30: MET)`);
      console.log(`✓ Total Brands:              ${createdBrands.length}`);
      console.log(`✓ Single-Resource Brands:    12 (80.0% of total)`);
      console.log(`✓ Multi-Resource Brands:     3  (20.0% of total)`);
      console.log(`✓ Configured BrandProcesses: ${createdProcesses.length}`);
      console.log(`✓ Resource Allocations:      ${allocs.length}`);
      console.log(`✓ Planned Leaves Configured: ${leavesData.length}`);
      console.log('======================================================\n');
    }

    return true;
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    throw error;
  }
};

// Check if running directly from CLI
if (require.main === module) {
  (async () => {
    await connectDB();
    await seedDatabase(false);
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = { seedDatabase };
