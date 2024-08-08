import { type FC, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, Tooltip } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

interface IProps {
  hoverTitle: string;
  nodeID: string;
  children?: React.ReactNode;
}

const FilterIcon: FC<IProps> = props => {
  const { hoverTitle, nodeID, children } = props;
  const [node, setNode] = useState<any>(null);
  const [height, setHeight] = useState<string | number>(0);

  const filterClick = () => {
    if (height === 0) {
      setHeight('auto');
    } else {
      setHeight(0);
    }
  };
  useEffect(() => {
    const targetNode = document.getElementById(nodeID);
    setNode(targetNode);
  }, [nodeID]);
  return (
    <>
      <Tooltip placement="bottom" title={hoverTitle}>
        <Button
          onClick={filterClick}
          icon={
            <FilterOutlined
              style={{
                fontSize: 16,
              }}
            />
          }
          type="text"
        ></Button>
      </Tooltip>
      {node &&
        ReactDOM.createPortal(
          <motion.div
            animate={{ height }}
            className="filter-conditions"
            style={{
              height: 0,
              overflow: 'hidden',
              width: '100%',
              backgroundColor: '#f5f5f5',
              borderRadius: 4,
              marginTop: 10,
              padding: '0 16px',
            }}
          >
            {children}
          </motion.div>,
          node,
        )}
    </>
  );
};
export default FilterIcon;

