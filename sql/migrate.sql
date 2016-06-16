INSERT INTO leylines.poi(site, description, object_sub_type, bovis_units, data_owner, links, x_coord, y_coord, z_coord)
SELECT site, description, object_sub_type, bovis_units, data_owner, links, x_coord, y_coord, z_coord
FROM poi.alignments;
