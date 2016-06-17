SET @schemaName = 'leylines';
SET @tableName = 'poi';

SET @maintable = @schemaName + '.' + @tableName;
SET @relationtable = @schemaName + '.' + @tableName + '_' + 'object_type';
SET @pkey =  @tableName + '_pkey';
SET @gidx = @tableName + '_gidx';
SET @pidx = @tableName + '_pidx';

CREATE TABLE @maintable
(
  id serial NOT NULL,
  site text,
  description text,
  object_sub_type integer references object_sub_types(id) DEFAULT 1,
  bovis_units integer DEFAULT 0,
  data_owner text,
  links text,
  importance integer references object_importance(id) DEFAULT 1,
  x_coord double precision,
  y_coord double precision,
  z_coord double precision,
  geom geometry(PointZ,4326),
  date_creation timestamp without time zone,
  date_modification timestamp without time zone,
  country text,
  CONSTRAINT @pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);

ALTER TABLE @maintable
  OWNER TO postgres;
GRANT SELECT ON TABLE @maintable TO public;
GRANT ALL ON TABLE @maintable TO postgres;

CREATE INDEX @pidx
  ON @maintable
  (site);

CREATE INDEX @gidx
  ON @maintable
  USING gist
  (geom);

CREATE TRIGGER "01_trigger_date_update"
  BEFORE INSERT OR UPDATE
  ON @maintable
  FOR EACH ROW
  EXECUTE PROCEDURE date_update();

CREATE TRIGGER "02_trigger_point_geom_add_object_type"
  AFTER INSERT
  ON leylines.poi
  FOR EACH ROW
  EXECUTE PROCEDURE point_geom_add_object_type();

CREATE TRIGGER "05_trigger_point_geom_get_coords"
  BEFORE INSERT OR UPDATE
  ON @maintable
  FOR EACH ROW
  EXECUTE PROCEDURE point_geom_get_coords();

CREATE TRIGGER "10_trigger_point_geom_update"
  BEFORE INSERT OR UPDATE
  ON @maintable
  FOR EACH ROW
  EXECUTE PROCEDURE point_geom_update();

CREATE TRIGGER "20_trigger_point_geom_get_country"
  BEFORE INSERT OR UPDATE
  ON @maintable
  FOR EACH ROW
  EXECUTE PROCEDURE point_geom_get_country();

CREATE TABLE @relationtable  ( 
  site_id int4 NOT NULL,
  object_id int4 NOT NULL,
  date_creation timestamp without time zone,
  date_modification timestamp without time zone,
  PRIMARY KEY(site_id,object_id)
)
WITH (
  OIDS=FALSE
);

ALTER TABLE @relationtable
  OWNER TO postgres;
GRANT SELECT ON TABLE @relationtable TO public;
GRANT ALL ON TABLE @relationtable TO postgres;

ALTER TABLE @relationtable
  ADD CONSTRAINT site_id_fkey
  FOREIGN KEY (site_id)
  REFERENCES @maintable(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

ALTER TABLE @relationtable
  ADD CONSTRAINT object_id_fkey
  FOREIGN KEY (object_id)
  REFERENCES object_type(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;
  
CREATE TRIGGER "01_trigger_date_update"
  BEFORE INSERT OR UPDATE
  ON @relationtable
  FOR EACH ROW
  EXECUTE PROCEDURE date_update();
