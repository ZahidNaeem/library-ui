const ListCast = ({cast, onChoice})=> {

  return (
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(90px,1fr))`,
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {
          cast.map(member =>
          <img onClick={()=> onChoice(member)} src={`images/${member.slug}_tn.svg`} alt={member.name} key={member.id} data-toggle="tooltip" title={member.name}/>
          )
        }
      </div>
  );

}
export default ListCast;