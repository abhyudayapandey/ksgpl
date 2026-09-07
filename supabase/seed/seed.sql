-- KSGPL Catalog POC — sample seed data
-- Real product line extracted from the KSGPL / Odyssey LED lighting catalog.
-- Safe to re-run: catalog type upserts by slug, products are only inserted
-- if a product with the same name doesn't already exist under that catalog type.

insert into public.catalog_types (name, slug, description, display_order)
values (
  'LED Lighting Products',
  'led-lighting-products',
  'Odyssey-branded LED lights, drivers, housings and lighting accessories.',
  1
)
on conflict (slug) do nothing;

insert into public.company_info (name, brand_name, tagline, description, established_year, address, phone, email, website)
select
  'Kundan Switchgears Pvt Ltd',
  'ODYSSEY',
  'Convergence of Innovation',
  'Kundan Switchgears Pvt Ltd is engaged in manufacturing of LED lights & its accessories such as LED light drivers, LED light housing and components for switchgear and electronics industries, since 1992, under the brand name "ODYSSEY". Over the years we have integrated multiple disciplines - mould design, mould manufacturing, electronics production and mass manufacturing - into developing our own lighting products.',
  1992,
  'S92 NH8, Madri, Udaipur, Rajasthan',
  '+91-9414158166',
  null,
  'www.kundanswitchgears.com'
where not exists (select 1 from public.company_info);

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Canary Light', 'COB Lights', '{"Wattages":"12W / 18W / 24W","Color Temp":"WW / NW / CW","Beam Angle":"120°","Cutout":"110mm / 138mm / 160mm","Height":"50mm","Body Color":"White / Black"}'::jsonb, array['Smart control']::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Canary Light'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Uni COB', 'COB Lights', '{"Wattages":"7W / 12W / 18W","Color Temp":"WW / NW / CW","Beam Angle":"36°","Cutout":"55mm / 75mm / 95mm","Height":"59mm / 85mm / 105mm","Body Color":"White / Black","Ref Color":"White / Matt Black / Gold / Gun Black / Chrome"}'::jsonb, array['Smart control']::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Uni COB'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Blaze COB', 'COB Lights', '{"Wattages":"7W / 12W / 18W","Color Temp":"WW / NW / CW","Beam Angle":"36°","Cutout":"55mm / 75mm / 85mm","Height":"65mm / 75mm / 100mm","Body Color":"White / Black"}'::jsonb, array['Smart control']::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Blaze COB'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Shimmer COB', 'COB Lights', '{"Wattages":"4W / 7W / 12W","Color Temp":"WW / NW / CW","Beam Angle":"36° / 28°","Cutout":"28mm / 35mm / 55mm","Height":"28mm / 52mm / 63mm","Body Color":"White / Black / Grey"}'::jsonb, array['Smart control']::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Shimmer COB'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Darrow COB', 'COB Lights', '{"Wattages":"7W / 12W / 18W","Color Temp":"WW / NW / CW","Beam Angle":"36°","Cutout":"55mm / 75mm / 85mm","Height":"43mm / 45mm / 49mm","Body Color":"White / Black","Ref Color":"White / Matt Black / Gold / Gun Black / Chrome"}'::jsonb, array['Smart control', 'Detachable']::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Darrow COB'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Swan COB', 'COB Lights', '{"Wattages":"12W / 18W","Color Temp":"WW / NW / CW","Beam Angle":"36°","Cutout":"75mm / 95mm","Body Color":"White / Black"}'::jsonb, array['Smart control']::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Swan COB'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Delta COB', 'COB Lights', '{"Wattages":"7W / 12W / 18W","Color Temp":"WW / NW / CW","Beam Angle":"36°","Cutout":"55mm / 75mm / 85mm","Height":"65mm / 75mm / 100mm","Body Color":"White / Black","Ref Color":"White / Matt Black / Gold"}'::jsonb, array['Smart control']::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Delta COB'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Orca COB', 'COB Lights', '{"Wattages":"7W / 12W","Color Temp":"WW / NW / CW","Beam Angle":"36°","Cutout":"55X55mm / 75X75mm","Height":"52mm","Body Color":"White / Black"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Orca COB'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Laser Deep Light', 'Laser Lights', '{"Wattages":"6W / 12W / 18W","Color Temp":"WW / NW / CW","Beam Angle":"45°","Height":"65X25mm / 125X25mm / 95mmX95mm","Body Color":"White / Black"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Laser Deep Light'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Laser Tilt Light', 'Laser Lights', '{"Wattages":"6W / 12W / 24W","Color Temp":"WW / NW / CW","Beam Angle":"45°","Height":"78X43mm / 136X43mm / 147X49mm","Body Color":"White / Black"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Laser Tilt Light'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Pith PC Downlight', 'Downlights', '{"Wattages":"12W / 18W","Color Temp":"WW / NW / CW","Beam Angle":"120°","Dimension":"130mm / 150mm","Body Color":"White"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Pith PC Downlight'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Slim Panel Light', 'Downlights', '{"Wattages":"9W / 15W / 20W","Color Temp":"WW / NW / CW","Beam Angle":"120°","Cutout":"100mm / 150mm / 200mm","Height":"14mm"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Slim Panel Light'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, '2X2 Panel Light', 'Panel Lights', '{"Wattages":"36W","Color Temp":"WW / NW / CW","Beam Angle":"120°","Dimension":"595mm X 595mm","Height":"32mm","Body Color":"White"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = '2X2 Panel Light'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, '1X4 Panel Light', 'Panel Lights', '{"Wattages":"36W","Color Temp":"WW / NW / CW","Beam Angle":"120°","Dimension":"1195mm X 295mm","Height":"32mm","Body Color":"White"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = '1X4 Panel Light'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'LED Batten', 'Batten Lights', '{"Wattages":"7W / 12W / 18W","Color Temp":"WW / NW / CW","Beam Angle":"120°","Height":"75mm / 95mm / 125mm","Body Color":"White / Black","Operation Mode":"80% dimming","Range of Detection":"8 meter"}'::jsonb, array['Motion Sensor']::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'LED Batten'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Focus Wall Light', 'Wall Lights', '{"Wattages":"20W / 30W","Color Temp":"WW / NW / CW","Beam Angle":"24°","Dimension":"135mm / 160mm","Body Color":"White / Black"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Focus Wall Light'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Wall Washer', 'Wall Lights', '{"Wattages":"18W / 36W / 48W / 72W","Length":"0.5M / 1M / 1.2M / 1M","Protections":"IP65","Beam Angle":"15° / 30°","Body Color":"Silver"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Wall Washer'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Facade Light', 'Facade Lights', '{"Wattages":"7W","Color Temp":"WW / NW / CW","Beam Angle":"7°","Cutout":"70mm / 130mm","Body Color":"Grey"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Facade Light'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Track Lens COB', 'Track Lights', '{"Wattages":"20W / 30W","Color Temp":"WW / NW / CW","Beam Angle":"24°","Length":"145mm / 150mm","Body Color":"White / Black"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Track Lens COB'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Hanging Linear 5070', 'Linear Lights', '{"Wattages":"36W / 48W","Color Temp":"WW / NW / CW","Beam Angle":"120°","Dimension":"50mm X 70mm X 1200mm","Body Color":"White / Black"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Hanging Linear 5070'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Strip Lights', 'Strip & Rope Lights', '{"LED/meter":"120 / 180 / 240 - 2835 LED","Wattage per meter":"10W / 15W / 20W","CCT":"WW / NW / CW","Width":"5mm / 8mm / 10mm","Protections":"IP65 in 120LED/meter","Input Voltage":"12V / 24V"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Strip Lights'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Rope Light', 'Strip & Rope Lights', '{"LED/meter":"120 LED/meter - 2835 LED","CCT":"WW","Width":"10mm","Input Voltage":"220V AC"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Rope Light'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Ultra Slim Magnetic Track', 'Track Lights', '{}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Ultra Slim Magnetic Track'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Sensors AC', 'Sensors & Controls', '{"Type":"2+2 2 way / 3+3 2 way","Operation Mode":"On / Off","Current Rating":"7A 1.5 KVA","Holding Time":"8s - 100s","Detection Range":"8 meter"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Sensors AC'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Staircase Step Controller', 'Sensors & Controls', '{"Input Voltage":"12V / 24V","Max Load":"12V - 15W/Step (300W); 24V - 20W/Step (400W)","No of Steps":"32","Sensor Type":"PIR motion (2Pcs)","Sensing Distance":"0.1 - 2 Meters","Size":"185X78X25mm"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Staircase Step Controller'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'SMPS 12V DC', 'Drivers & Accessories', '{"Input Voltage":"12V DC","Options":"2.5A/30W, 5A/60W, 10A/120W, 12.5A/150W, 25A/300W","Power Factor":"Isolated / 0.95PF","Warranty":"2 Years"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'SMPS 12V DC'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'SMPS 24V DC', 'Drivers & Accessories', '{"Input Voltage":"24V DC","Options":"2.5A/60W, 5A/120W, 10A/240W, 12.5A/300W, 16.5A/400W","Power Factor":"Isolated / 0.95PF","Warranty":"2 Years"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'SMPS 24V DC'
  );

insert into public.products (catalog_type_id, name, category, specs, tags, is_active)
select ct.id, 'Aluminum Profile', 'Profiles & Accessories', '{"Included Accessories":"2 clips + 2 end caps / meter"}'::jsonb, '{}'::text[], true
from public.catalog_types ct
where ct.slug = 'led-lighting-products'
  and not exists (
    select 1 from public.products pr where pr.catalog_type_id = ct.id and pr.name = 'Aluminum Profile'
  );

-- A second, initially-empty catalog type, to demonstrate that admins can add
-- more catalog types beyond the one seeded above (each shows as its own tab
-- for end users once it has products).
insert into public.catalog_types (name, slug, description, display_order)
values (
  'Raw Materials & Components',
  'raw-materials-components',
  'Components and raw materials used in manufacturing (add products here as an example of a second catalog tab).',
  2
)
on conflict (slug) do nothing;
