import {
  CallRouting,
  CallRoutingRemove,
  OperatorFormView,
  OperatorRemoveBtn,
} from '@erxes/ui-inbox/src/settings/integrations/styles';
import { FlexItem, LeftItem } from '@erxes/ui/src/components/step/styles';
import {
  ICallData,
  IDepartment,
} from '@erxes/ui-inbox/src/settings/integrations/types';
import React, { useState } from 'react';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import Toggle from '@erxes/ui/src/components/Toggle';
import { __ } from 'coreui/utils';

type Props = {
  onChange: (name: any, value: any) => void;
  callData?: ICallData;
};

const CloudflareCalls: React.FC<Props> = ({ onChange, callData }) => {
  const [departments, setDepartments] = useState<IDepartment[]>(
    callData?.departments || [],
  );
  const [routingName, setRoutingName] = useState('');
  const [header, setHeader] = useState(callData?.header || '');
  const [description, setDescription] = useState(callData?.description || '');

  const [secondPageHeader, setSecondPageHeader] = useState(
    callData?.secondPageHeader || '',
  );
  const [secondPageDescription, setSecondPageDescription] = useState(
    callData?.secondPageDescription || '',
  );

  const [isCallReceive, setIsCallReceive] = useState(
    Boolean(callData?.isReceiveWebCall) || false,
  );

  const updateDepartmentName = (name: string) => {
    const updatedDepartments = departments.map((dept) =>
      dept.name === name ? { ...dept, name: routingName } : dept,
    );
    setDepartments(updatedDepartments);

    onChange('callData', {
      header,
      description,
      secondPageDescription,
      secondPageHeader,
      departments: updatedDepartments,
      isReceiveWebCall: isCallReceive,
    });
  };

  const updateHeader = (name: string) => {
    setHeader(name);

    onChange('callData', {
      header: name,
      description,
      secondPageDescription,
      secondPageHeader,
      departments: departments,
      isReceiveWebCall: isCallReceive,
    });
  };

  const updateDescription = (name: string) => {
    setDescription(name);

    onChange('callData', {
      header,
      description: name,
      secondPageDescription,
      secondPageHeader,
      departments: departments,
      isReceiveWebCall: isCallReceive,
    });
  };
  const updateSecondPageHeader = (name: string) => {
    setSecondPageHeader(name);

    onChange('callData', {
      description,
      secondPageDescription,
      secondPageHeader: name,
      departments: departments,
      isReceiveWebCall: isCallReceive,
    });
  };

  const updateSecondPageDescription = (name: string) => {
    setDescription(name);

    onChange('callData', {
      header,
      secondPageDescription: name,
      secondPageHeader,
      departments: departments,
      isReceiveWebCall: isCallReceive,
    });
  };

  const addDepartment = () => {
    const newDepartment = { name: '', operators: [] };
    setDepartments((prev) => [...prev, newDepartment]);
  };

  const addOperator = (departmentName: string) => {
    setDepartments((prev) =>
      prev.map((dept) =>
        dept.name === departmentName
          ? {
              ...dept,
              operators: [...dept.operators, { userId: '', name: '' }],
            }
          : dept,
      ),
    );
  };

  const removeOperator = (departmentName: string, index: number) => {
    const updatedDepartments = departments.map((dept) =>
      dept.name === departmentName
        ? {
            ...dept,
            operators: dept?.operators?.filter((_, i) => i !== index),
          }
        : dept,
    );
    setDepartments(updatedDepartments);
    onChange('callData', {
      header,
      description,
      secondPageDescription,
      secondPageHeader,
      departments: updatedDepartments,
      isReceiveWebCall: isCallReceive,
    });
  };

  // Add this function to remove a department
  const removeDepartment = (departmentName: string) => {
    const updatedDepartments = departments.filter(
      (dept) => dept.name !== departmentName,
    );
    setDepartments(updatedDepartments);
    onChange('callData', {
      header,
      description,
      secondPageDescription,
      secondPageHeader,
      departments: updatedDepartments,
      isReceiveWebCall: isCallReceive,
    });
  };

  const handleToggleWebCall = (e) => {
    const isChecked = e.target.checked;
    setIsCallReceive(isChecked);
    onChange('callData', {
      header,
      description,
      secondPageDescription,
      secondPageHeader,
      departments: departments,
      isReceiveWebCall: isChecked,
    });
  };

  const handleOperatorChange = (
    departmentName: string,
    index: number,
    userId: string,
  ) => {
    const updatedDepartments = departments.map((dept) =>
      dept.name === departmentName
        ? {
            ...dept,
            operators: dept.operators?.map((op, i) =>
              i === index ? { ...op, userId } : op,
            ),
          }
        : dept,
    );

    setDepartments(updatedDepartments);
    onChange('callData', {
      header,
      description,
      secondPageDescription,
      secondPageHeader,
      departments: updatedDepartments,
      isReceiveWebCall: isCallReceive,
    });
  };

  const renderCallRouting = () => {
    return departments.map(({ name, operators }) => (
      <CallRouting key={name}>
        <ControlLabel required>{__('Call routing name')}</ControlLabel>
        <FormControl
          className="routing-name"
          required
          onChange={(e) =>
            setRoutingName((e.currentTarget as HTMLInputElement).value)
          }
          onBlur={(e) => updateDepartmentName(name)}
          defaultValue={name}
        />
        {operators?.map((operator, index) => (
          <OperatorFormView key={index}>
            <OperatorRemoveBtn>
              <Button
                onClick={() => removeOperator(name, index)}
                btnStyle="danger"
                icon="times"
              />
            </OperatorRemoveBtn>
            <FormGroup>
              <SelectTeamMembers
                label={`Choose operator ${index + 1}`}
                name="selectedMembers"
                multi={false}
                initialValue={operator.userId}
                onSelect={(value) =>
                  handleOperatorChange(name, index, value as string)
                }
              />
            </FormGroup>
          </OperatorFormView>
        ))}
        <FormGroup>
          <Button
            btnStyle="simple"
            icon="plus-1"
            size="medium"
            onClick={() => addOperator(name)}
          >
            {__('Add Operator')}
          </Button>
        </FormGroup>
        {/* Add a button to remove the department */}
        <CallRoutingRemove onClick={() => removeDepartment(name)}>
          <Icon icon="times" size={16} />
        </CallRoutingRemove>
      </CallRouting>
    ));
  };

  return (
    <FlexItem>
      <LeftItem>
        <FormGroup>
          <ControlLabel>{__('Header')}</ControlLabel>
          <FormControl
            type="text"
            placeholder={__('Enter header text')}
            onChange={(e) =>
              setHeader((e.currentTarget as HTMLInputElement).value)
            }
            onBlur={(e) =>
              updateHeader((e.currentTarget as HTMLInputElement).value)
            }
            defaultValue={header}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            type="textarea"
            placeholder={__('Enter description text')}
            onChange={(e) =>
              setDescription((e.currentTarget as HTMLInputElement).value)
            }
            onBlur={(e) =>
              updateDescription((e.currentTarget as HTMLInputElement).value)
            }
            defaultValue={description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Second Page Header')}</ControlLabel>
          <FormControl
            type="text"
            placeholder={__('Enter second page header text')}
            onChange={(e) =>
              setSecondPageHeader((e.currentTarget as HTMLInputElement).value)
            }
            onBlur={(e) =>
              updateSecondPageHeader(
                (e.currentTarget as HTMLInputElement).value,
              )
            }
            defaultValue={secondPageHeader}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            type="textarea"
            placeholder={__('Enter description text')}
            onChange={(e) =>
              setSecondPageDescription(
                (e.currentTarget as HTMLInputElement).value,
              )
            }
            onBlur={(e) =>
              updateSecondPageDescription(
                (e.currentTarget as HTMLInputElement).value,
              )
            }
            defaultValue={secondPageDescription}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Call Routing')}</ControlLabel>
          <p>
            {__(
              'The visitor chooses a department, group, or team. The system directs the call to that group.',
            )}
          </p>
          {renderCallRouting()}
          <Button
            btnStyle="link"
            icon="plus-1"
            size="medium"
            onClick={addDepartment}
          >
            {__('Add Call Routing')}
          </Button>
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Turn on Cloudflare Calls')}</ControlLabel>
          <p>{__('If turned on, possible to receive web calls')}</p>
          <Toggle
            checked={isCallReceive || false}
            onChange={handleToggleWebCall}
            icons={{
              checked: <span>{__('Yes')}</span>,
              unchecked: <span>{__('No')}</span>,
            }}
          />
        </FormGroup>
      </LeftItem>
    </FlexItem>
  );
};

export default CloudflareCalls;
