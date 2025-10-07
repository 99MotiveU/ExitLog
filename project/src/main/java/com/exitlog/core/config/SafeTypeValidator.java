package com.exitlog.core.config;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.cfg.MapperConfig;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;

public class SafeTypeValidator extends PolymorphicTypeValidator {

	@Override
	public Validity validateBaseType(MapperConfig<?> config, JavaType baseType) {
		return Validity.INDETERMINATE;//기본타입
	}

	@Override
	public Validity validateSubClassName(MapperConfig<?> config, JavaType baseType, String subClassName)
			throws JsonMappingException {
        if (subClassName.startsWith("com.exitlog.calendar.model.entity.")) {
            return Validity.ALLOWED;
        }
		return Validity.DENIED;
	}

	@Override
	public Validity validateSubType(MapperConfig<?> config, JavaType baseType, JavaType subType)
			throws JsonMappingException {
	      String className = subType.getRawClass().getName();
	        if (className.startsWith("com.exitlog.calendar.model.entity.")) {
	            return Validity.ALLOWED;
	        }
		return Validity.DENIED;
	}

}
